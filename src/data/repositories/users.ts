import { DateTime, DurationUnit } from 'luxon';
import { col, fn, Op, Transaction } from 'sequelize';
import { Profile as VkProfile } from 'passport-vkontakte';

import BaseRepository from './base';
import { RefStatus, SocialType, User } from '../models/User';
import { UserError } from '../../utils/errors';
import { GraphDataEntry, Referral, RefStatsPeriod } from '../../__generated__/graphql';
import { generateRandomNumbers, generateSeed } from '../../utils/crypto';

// TODO: Maybe move it to settings or config
// Referral system settings
const FREE_REFERRALS = 2;
const REF_A = 40;
const REF_D = 10;
const INITIAL_REFERRAL_INCOME = 10;

class UsersRepository extends BaseRepository {
    static periodMapping: Record<RefStatsPeriod, DurationUnit> = {
        [RefStatsPeriod.Week]: 'week',
        [RefStatsPeriod.Month]: 'month',
        [RefStatsPeriod.Year]: 'year',
    };

    async createUser(socialType: SocialType, socialId: string, username: string, avatar: string): Promise<User> {
        return this.db.User.create({
            socialType,
            socialId,
            username,
            avatar,
            clientSeed: generateSeed(),
            serverSeed: generateSeed(),
        });
    }

    async authVk(profile: VkProfile): Promise<[User, boolean]> {
        let user: User | null = await this.db.User.findOne({
            where: {
                socialType: SocialType.VK,
                socialId: profile.id,
            },
        });

        const avatar = profile.photos ? profile.photos[0].value : 'default_avatar'; // TODO: default avatar

        if (!user) {
            user = await this.createUser(SocialType.VK, profile.id, profile.displayName, avatar);

            // Add to chat for admin announcements
            const aaChat = await this.repositories.chats.getAdminAnnouncementsChat();
            await aaChat.addMember(user);

            return [user, true];
        }

        return [user, false];
    }

    async getUserById(userId: string, transaction?: Transaction): Promise<User | null> {
        return this.db.User.findByPk(userId, {
            ...this.sequelizeContext,
            ...(transaction && { transaction, lock: transaction.LOCK.UPDATE }),
            rejectOnEmpty: false,
        });
    }

    async getUserByIdStrict(userId: string, transaction?: Transaction): Promise<User> {
        const user = await this.getUserById(userId, transaction);

        if (!user) {
            throw new UserError('NO_USER');
        }

        return user;
    }

    async giveMoney(userId: string, amount: number): Promise<User> {
        return this.db.sequelize.transaction(async transaction => {
            const user = await this.getUserByIdStrict(userId, transaction);

            return user.update({ money: user.money + amount }, { transaction });
        });
    }

    async withdrawMoney(userId: string, amount: number): Promise<User> {
        return this.db.sequelize.transaction(async transaction => {
            const user = await this.getUserByIdStrict(userId, transaction);

            if (user.money < amount) {
                throw new UserError('NOT_ENOUGH_MONEY');
            }

            return user.update({ money: user.money - amount }, { transaction });
        });
    }

    private async calcReferralsCountDelta(referrer: User, transaction?: Transaction): Promise<number> {
        const possibleReferralsCount =
            Math.max(
                Math.floor(
                    (REF_D - 2 * REF_A + Math.sqrt((2 * REF_A - REF_D) ** 2 + 8 * REF_D * referrer.turnover)) /
                        (2 * REF_D),
                ),
                0,
            ) + FREE_REFERRALS;
        const actualReferralsCount = await this.db.User.count({
            where: {
                refId: referrer.id,
                refStatus: RefStatus.Active,
            },
            transaction,
        });

        return possibleReferralsCount - actualReferralsCount;
    }

    async setReferrer(userId: string, refId: string): Promise<User> {
        return this.db.sequelize.transaction(async transaction => {
            const user = await this.getUserByIdStrict(userId, transaction);
            const referrer = await this.getUserById(refId, transaction);

            if (referrer) {
                const referralsCountDelta = await this.calcReferralsCountDelta(referrer, transaction);

                if (referralsCountDelta > 0) {
                    await user.update({ money: user.money + INITIAL_REFERRAL_INCOME }, { transaction });
                    await referrer.update({ refMoney: referrer.refMoney + INITIAL_REFERRAL_INCOME }, { transaction });
                    await this.repositories.referralIncomes.writeIncome(
                        referrer.id,
                        user.id,
                        INITIAL_REFERRAL_INCOME,
                        transaction,
                    );
                }

                return user.update(
                    {
                        refId: referrer.id,
                        refStatus: referralsCountDelta > 0 ? RefStatus.Active : RefStatus.Frozen,
                    },
                    { transaction },
                );
            }

            return user;
        });
    }

    async increaseTurnover(userId: string, amount: number): Promise<User> {
        return this.db.sequelize.transaction(async transaction => {
            let user = await this.getUserByIdStrict(userId, transaction);
            user = await user.update({ turnover: user.turnover + amount }, { transaction });

            const referralsCountDelta = await this.calcReferralsCountDelta(user!, transaction);
            if (referralsCountDelta > 0) {
                const newReferrals: User[] = await this.db.User.findAll({
                    where: {
                        refId: userId,
                        refStatus: RefStatus.Frozen,
                    },
                    order: [['createdAt', 'ASC']],
                    limit: referralsCountDelta,
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });

                if (newReferrals.length === 0) {
                    return user;
                }

                await Promise.all(
                    newReferrals.map(async referral => {
                        await referral.update(
                            {
                                money: referral.money + INITIAL_REFERRAL_INCOME,
                                refStatus: RefStatus.Active,
                            },
                            { transaction },
                        );
                        await this.repositories.referralIncomes.writeIncome(
                            user.id,
                            referral.id,
                            INITIAL_REFERRAL_INCOME,
                            transaction,
                        );
                    }),
                );

                return user.update(
                    { refMoney: user.refMoney + newReferrals.length * INITIAL_REFERRAL_INCOME },
                    { transaction },
                );
            }

            return user;
        });
    }

    async giveIncomeToReferrer(referralId: string, ourProfit: number): Promise<void> {
        const referral = await this.getUserByIdStrict(referralId);
        const { refId } = referral;

        if (refId) {
            await this.db.sequelize.transaction(async transaction => {
                const referrer = await this.getUserByIdStrict(refId, transaction);
                const incomeAmount = (ourProfit * referrer.refPercent) / 100;

                await referrer.update({ refMoney: referrer.refMoney + incomeAmount }, { transaction });
                await this.repositories.referralIncomes.writeIncome(refId, referralId, incomeAmount, transaction);
            });
        }
    }

    async getReferralsCount(referrerId: string): Promise<number> {
        return this.db.User.count({
            where: {
                refId: referrerId,
            },
        });
    }

    async getTopReferralUserId(start: Date, finish: Date): Promise<{ refId: string; value: number } | null> {
        return this.db.User.findOne({
            attributes: ['refId', [fn('SUM', col('amount')), 'value']],
            where: {
                createdAt: { [Op.between]: [start, finish] },
            },
            group: col('refId'),
            order: [[col('value'), 'DESC']],
            limit: 1,
            raw: true,
        });
    }

    async getReferrals(referrerId: string, offset: number): Promise<Referral[]> {
        const results = this.db.User.findAll({
            attributes: [
                'id',
                'username',
                'avatar',
                ['refStatus', 'status'],
                [fn('IF', fn('STRCMP', col('refStatus'), 'Active'), 0, 1), 'isActive'],
                'createdAt',
                [fn('COUNT', col('referrerIncomes.id')), 'gamesCount'],
                [fn('SUM', col('referrerIncomes.amount')), 'income'],
            ],
            where: {
                refId: referrerId,
            },
            include: [{ association: this.db.User.ReferrerIncome, attributes: [] }],
            group: col('User.id'),
            order: [['createdAt', 'DESC']],
            offset,
            subQuery: false,
            raw: true,
        });

        return results;
    }

    async getReferralsStats(referrerId: string, period: RefStatsPeriod): Promise<GraphDataEntry[]> {
        const startDateTime = DateTime.local()
            .startOf(UsersRepository.periodMapping[period])
            .toSQL();
        const format = period === RefStatsPeriod.Year ? '15.%m.%Y' : '%d.%m.%Y';

        return this.db.User.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('createdAt'), format), 'date'],
                [fn('COUNT', '*'), 'value'],
            ],
            where: {
                refId: referrerId,
                createdAt: { [Op.gte]: startDateTime },
            },
            group: col('date'),
            raw: true,
        });
    }

    async updateClientSeed(userId: string, clientSeed?: string): Promise<User> {
        const user = await this.getUserByIdStrict(userId);

        return user.update({ clientSeed: clientSeed ?? generateSeed() });
    }

    async updateServerSeed(userId: string): Promise<string> {
        const user = await this.getUserByIdStrict(userId);
        const oldServerSeed = user.serverSeed;

        await user.update({
            serverSeed: generateSeed(),
            nonce: 0,
        });

        return oldServerSeed;
    }

    async generateRandomNumbers(userId: string, count: number): Promise<number[]> {
        return this.db.sequelize.transaction(async transaction => {
            const user = await this.getUserByIdStrict(userId, transaction);
            const { nonce } = user;

            await user.update({ nonce: nonce + 1 }, { transaction });

            return generateRandomNumbers(user.serverSeed, user.clientSeed, nonce, count);
        });
    }

    async warnChat(userId: string): Promise<User> {
        const now = Date.now();
        const user = await this.getUserByIdStrict(userId);

        return user.update({
            chatWarns: Math.min(user.chatWarns + 1, 5),
            chatWarnsUpdatedAt: new Date(now),
        });
    }
}

export default UsersRepository;
