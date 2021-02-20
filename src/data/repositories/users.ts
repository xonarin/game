import { DateTime, DurationUnit } from 'luxon';
import { col, fn, Op, Transaction } from 'sequelize';
import { Profile as VkProfile } from 'passport-vkontakte';

import BaseRepository from './base';
import { RefStatus, SocialType, User } from '../models/User';
import { UserError } from '../../utils/errors';
import { GraphDataEntry, Referral, RefStatsPeriod } from '../../__generated__/graphql';
import { generateRandomNumbers, generateSeed } from '../../utils/crypto';
import { PaymentStatus } from '../models/UserPayment';
import { vkIsMemberOfGroup } from '../../utils/vk';
import pubsub from '../pubsub';

// TODO: Maybe move it to settings or config
// Referral system settings
const FREE_REFERRALS = 5000;
const REF_A = 1;
const REF_D = 1;

class UsersRepository extends BaseRepository {
    static periodMapping: Record<RefStatsPeriod, DurationUnit> = {
        [RefStatsPeriod.Week]: 'week',
        [RefStatsPeriod.Month]: 'month',
        [RefStatsPeriod.Year]: 'year',
    };

    async createUser(
        socialType: SocialType,
        socialId: string,
        username: string,
        avatar: string,
        transaction: Transaction,
    ): Promise<User> {
        return this.db.User.create(
            {
                socialType,
                socialId,
                username,
                avatar,
                clientSeed: generateSeed(),
                serverSeed: generateSeed(),
            },
            { transaction },
        );
    }

    authVk(profile: VkProfile): Promise<[User, boolean]> {
        return this.db.sequelize.transaction(async transaction => {
            let user: User | null = await this.db.User.findOne({
                where: {
                    socialType: SocialType.VK,
                    socialId: profile.id,
                },
                transaction,
            });

            const avatar = profile.photos ? profile.photos[0].value : 'default_avatar'; // TODO: default avatar

            if (!user) {
                user = await this.createUser(SocialType.VK, profile.id, profile.displayName, avatar, transaction);

                // Add to chat for admin announcements
                const aaChat = await this.repositories.chats.getAdminAnnouncementsChat(transaction);
                await aaChat.addMember(user, { transaction });

                return [user, true];
            }

            return [user, false];
        });
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

    async giveMoney(userId: string, amount: number, transaction?: Transaction): Promise<User> {
        const f = async (tr: Transaction) => {
            const user = await this.getUserByIdStrict(userId, tr);
            const payments = await this.repositories.payments.getPaymentsByUserId(userId, PaymentStatus.FINISHED, tr);

            const maxBalance =
                payments.length === 0
                    ? await this.repositories.settings.getSettingAsNumber('user::maxBalanceWithoutDeposits')
                    : Infinity;

            await user.update({ money: Math.min(maxBalance, user.money + amount) }, { transaction: tr });
            const newUser: User = await user.reload({ transaction: tr });

            pubsub
                .publish('balance', { userId, money: newUser.money, maxReached: newUser.money === maxBalance })
                .then();

            return newUser;
        };

        return transaction ? f(transaction) : this.db.sequelize.transaction(f);
    }

    async withdrawMoney(userId: string, amount: number, transaction?: Transaction): Promise<User> {
        const f = async (tr: Transaction) => {
            const user = await this.getUserByIdStrict(userId, tr);

            if (user.money < amount) {
                throw new UserError('NOT_ENOUGH_MONEY');
            }

            await user.update({ money: user.money - amount }, { transaction: tr });
            const newUser: User = await user.reload({ transaction: tr });

            pubsub.publish('balance', { userId, money: newUser.money, maxReached: false }).then();
            return newUser;
        };

        return transaction ? f(transaction) : this.db.sequelize.transaction(f);
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
        const INITIAL_REFERRAL_INCOMEUSER = await this.repositories.settings.getSettingAsNumber(
            'referrals::plusUserMoney',
        ); // Сколько начислится за реферала
        const INITIAL_REFERRAL_INCOMEREF = await this.repositories.settings.getSettingAsNumber(
            'referrals::plusRefMoney',
        ); // Сколько начислится за реферала
        return this.db.sequelize.transaction(async transaction => {
            const user = await this.getUserByIdStrict(userId, transaction);
            const referrer = await this.getUserById(refId, transaction);

            if (referrer) {
                const referralsCountDelta = await this.calcReferralsCountDelta(referrer, transaction);

                await this.giveMoney(user.id, INITIAL_REFERRAL_INCOMEREF, transaction);

                if (referralsCountDelta > 0) {
                    await referrer.update(
                        { refMoney: referrer.refMoney + INITIAL_REFERRAL_INCOMEUSER },
                        { transaction },
                    );
                    await this.repositories.referralIncomes.writeIncome(
                        referrer.id,
                        user.id,
                        INITIAL_REFERRAL_INCOMEUSER, // записываем в таблицу сколько человек получил за реферала
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

    async increaseTurnover(userId: string, amount: number, transaction?: Transaction): Promise<User> {
        const f = async (tr: Transaction) => {
            let user = await this.getUserByIdStrict(userId, tr);
            user = await user.update({ turnover: user.turnover + amount }, { transaction: tr });

            const referralsCountDelta = await this.calcReferralsCountDelta(user!, tr);
            if (referralsCountDelta > 0) {
                const newReferrals: User[] = await this.db.User.findAll({
                    where: {
                        refId: userId,
                        refStatus: RefStatus.Frozen,
                    },
                    order: [['createdAt', 'ASC']],
                    limit: referralsCountDelta,
                    transaction: tr,
                    lock: tr.LOCK.UPDATE,
                });

                if (newReferrals.length === 0) {
                    return user;
                }

                const INITIAL_REFERRAL_INCOMEUSER = await this.repositories.settings.getSettingAsNumber(
                    'referrals::plusUserMoney',
                ); // Сколько начислится за реферала

                await Promise.all(
                    newReferrals.map(async referral => {
                        await referral.update(
                            {
                                money: referral.money + INITIAL_REFERRAL_INCOMEUSER,
                                refStatus: RefStatus.Active,
                            },
                            { transaction: tr },
                        );

                        await this.repositories.referralIncomes.writeIncome(
                            user.id,
                            referral.id,
                            INITIAL_REFERRAL_INCOMEUSER,
                            tr,
                        );
                    }),
                );

                return user.update(
                    { refMoney: user.refMoney + newReferrals.length * INITIAL_REFERRAL_INCOMEUSER },
                    { transaction: tr },
                );
            }

            return user;
        };

        return transaction ? f(transaction) : this.db.sequelize.transaction(f);
    }

    async giveIncomeToReferrer(referralId: string, ourProfit: number, transaction?: Transaction): Promise<void> {
        const f = async (tr: Transaction) => {
            const referral = await this.getUserByIdStrict(referralId);
            const { refId } = referral;

            if (refId) {
                const referrer = await this.getUserByIdStrict(refId, tr);
                const incomeAmount = (ourProfit * referrer.refPercent) / 100;

                await referrer.update({ refMoney: referrer.refMoney + incomeAmount }, { transaction: tr });
                await this.repositories.referralIncomes.writeIncome(refId, referralId, incomeAmount, tr);
            }
        };

        return transaction ? f(transaction) : this.db.sequelize.transaction(f);
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
        return this.db.User.findAll({
            attributes: [
                'id',
                'username',
                'avatar',
                ['refStatus', 'status'],
                [fn('IF', fn('STRCMP', col('refStatus'), 'Active'), 0, 1), 'isActive'],
                'createdAt',
                [fn('COUNT', col('referrerIncomes.id')), 'gamesCount'],
                [fn('COALESCE', fn('SUM', col('referrerIncomes.amount')), 0), 'income'],
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

    getReferralMoney(userId: string) {
        return this.db.sequelize.transaction(async transaction => {
            const user = await this.getUserByIdStrict(userId, transaction);

            const minRefMoney = await this.repositories.settings.getSettingAsNumber('referrals::minRefMoneyToGet');
            if (user.refMoney < minRefMoney) {
                throw new UserError('NOT_ENOUGH_REF_MONEY');
            }

            const payments = await this.repositories.payments.getFinishedPaymentsSumByUserId(userId, transaction);
            const minPayments = await this.repositories.settings.getSettingAsNumber('referrals::minDepsToGetMoney');

            if (payments < minPayments) {
                throw new UserError('GET_REF_MONEY_NOT_ENOUGH_DEPS');
            }

            await this.giveMoney(userId, user.refMoney, transaction);
            return user.update({ refMoney: 0 }, { transaction });
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

    async sumBetsAmountFrom(userId: string, time: Date): Promise<number> {
        // Classic games no care. If you want to use it, take care about bonuses!

        const mines: number = await this.db.MinesGame.sum('betAmount', {
            where: { userId, createdAt: { [Op.gt]: time } },
        });

        return mines;
    }

    async getVkIdStrict(userId: string): Promise<string> {
        const user = await this.getUserByIdStrict(userId);

        if (user.socialType !== SocialType.VK) {
            throw new UserError('NOT_VK_USER');
        }

        return user.socialId;
    }

    async assertUserInVkGroup(userId: string): Promise<string> {
        const vkUserId = await this.getVkIdStrict(userId);
        const isMember = await vkIsMemberOfGroup(vkUserId);

        if (!isMember) {
            throw new UserError('NOT_IN_VK_GROUP');
        }

        return vkUserId;
    }
}

export default UsersRepository;
