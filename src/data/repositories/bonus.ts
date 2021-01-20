import { DateTime } from 'luxon';
import { Transaction } from 'sequelize';

import BaseRepository from './base';
import { Bonus } from '../models/Bonus';
import { UserError } from '../../utils/errors';
import KeyLocker from '../../utils/keyLocker';
import { PromoCode } from '../models/PromoCode';
import { PaymentStatus } from '../models/UserPayment';
import { PromoCodeUse } from '../models/PromoCodeUse';
import { vkGetFriendsCount, vkIsMemberOfGroup, vkIsPageClosed } from '../../utils/vk';

const promoCodeRegExp = /^\w{4,255}$/;

class BonusRepository extends BaseRepository {
    private getBonusLocker = new KeyLocker<string>();

    async assertHasBonus(userId: string): Promise<void> {
        const lastBonus: Bonus | null = await this.db.Bonus.findOne({
            where: { userId },
            order: [
                ['createdAt', 'DESC'],
                ['id', 'DESC'],
            ],
        });

        if (lastBonus) {
            const minutesFromLastBonus = DateTime.local()
                .diff(DateTime.fromJSDate(lastBonus.createdAt))
                .as('minutes');

            const minutesBetweenBonuses = await this.repositories.settings.getSettingAsNumber(
                'bonus::minsBetweenBonuses',
            );

            if (minutesFromLastBonus < minutesBetweenBonuses) {
                // console.log('has no bonus due to minutes', minutesFromLastBonus);
                throw new UserError('NOT_ENOUGH_MINS_FROM_BONUS');
            }

            const bets = await this.repositories.users.sumBetsAmountFrom(userId, lastBonus.createdAt);
            if (bets < lastBonus.amount) {
                // console.log('has no bonus due to bets', bets);
                throw new UserError('NOT_ENOUGH_BETS');
            }
        }

        await this.repositories.users.assertUserInVkGroup(userId);
    }

    async hasBonus(userId: string): Promise<boolean> {
        try {
            await this.assertHasBonus(userId);
            return true;
        } catch {
            return false;
        }
    }

    async getBonus(userId: string): Promise<number> {
        return this.getBonusLocker.use(userId, async locker => {
            await locker.lock();

            try {
                await this.assertHasBonus(userId);

                const amount = BonusRepository.generateBonusAmount();
                return this.db.sequelize.transaction(async transaction => {
                    await this.db.Bonus.create({ userId, amount });
                    await this.repositories.users.giveMoney(userId, amount, transaction);

                    return amount;
                });
            } finally {
                locker.unlock();
            }
        });
    }

    async getPromoCodeById(code: string, transaction?: Transaction): Promise<PromoCode | null> {
        return this.db.PromoCode.findByPk(code, {
            ...this.sequelizeContext,
            ...(transaction && { transaction, lock: transaction.LOCK.UPDATE }),
            rejectOnEmpty: false,
        });
    }

    async getPromoCodeByIdStrict(code: string, transaction?: Transaction): Promise<PromoCode> {
        const promoCode = await this.getPromoCodeById(code, transaction);

        if (!promoCode) {
            throw new UserError('NO_PROMO_CODE');
        }

        return promoCode;
    }

    async usePromoCode(userId: string, code: string): Promise<PromoCode> {
        const lastUse: PromoCodeUse | null = await this.db.PromoCodeUse.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });

        if (lastUse) {
            const bets = await this.repositories.users.sumBetsAmountFrom(userId, lastUse.createdAt);
            const lastUsePromoCode: PromoCode = await lastUse.getPromoCode();

            if (bets < lastUsePromoCode.amount) {
                throw new UserError('LAST_PROMO_CODE_DIDNT_BET');
            }
        }

        const vkUserId = await this.repositories.users.assertUserInVkGroup(userId);
        const isVkPageClosed = await vkIsPageClosed(vkUserId);

        if (isVkPageClosed) {
            throw new UserError('VK_PAGE_CLOSED');
        }

        const minFriendsCount = await this.repositories.settings.getSettingAsNumber(
            'bonus::minVkFriendsToUsePromoCode',
        );

        const vkFriendsCount = await vkGetFriendsCount(vkUserId);
        if (vkFriendsCount === undefined || vkFriendsCount < minFriendsCount) {
            throw new UserError('NOT_ENOUGH_VK_FRIENDS');
        }

        const fixedCode = code.toUpperCase();
        return this.db.sequelize.transaction(async transaction => {
            const promoCodeUses: PromoCode[] = await this.db.PromoCodeUse.findAll({
                where: { code: fixedCode },
                transaction,
            });

            if (promoCodeUses.some(promoCodeUse => promoCodeUse.userId === userId)) {
                throw new UserError('PROMO_CODE_USED_ALREADY');
            }

            const promoCode = await this.getPromoCodeByIdStrict(fixedCode, transaction);
            if (promoCodeUses.length >= promoCode.maxUses) {
                throw new UserError('PROMO_CODE_USES_LIMIT');
            }

            await this.repositories.users.giveMoney(userId, promoCode.amount, transaction);
            const promoCodeUse: PromoCodeUse = await this.db.PromoCodeUse.create(
                { code: fixedCode, userId },
                { transaction },
            );

            return promoCodeUse;
        });
    }

    async createPromoCode(userId: string, code: string, amount: number, maxUses: number): Promise<PromoCode> {
        if (code.match(promoCodeRegExp) === null || amount <= 0 || maxUses <= 0) {
            throw new UserError('BAD_PROMO_CODE');
        }

        const payments = await this.repositories.payments.getPaymentsByUserId(userId, PaymentStatus.FINISHED);
        const paymentsSum = payments.reduce((acc, payment) => acc + payment.sum, 0);
        const minPaymentsSum = await this.repositories.settings.getSettingAsNumber(
            'bonus::minDepositsToCreatePromoCode',
        );

        if (paymentsSum < minPaymentsSum) {
            throw new UserError('PROMO_CODE_NOT_ENOUGH_DEPOSITS');
        }

        await this.repositories.users.assertUserInVkGroup(userId);

        const fixedCode = code.toUpperCase();
        return this.db.sequelize.transaction(async transaction => {
            const existedPromoCode = await this.getPromoCodeById(fixedCode, transaction);

            if (existedPromoCode) {
                throw new UserError('PROMO_CODE_BUSIED');
            }

            const promoCode = await this.db.PromoCode.create(
                { code: fixedCode, userId, amount, maxUses },
                { transaction },
            );

            const cost = promoCode.amount * promoCode.maxUses;
            await this.repositories.users.withdrawMoney(userId, cost, transaction);

            return promoCode;
        });
    }

    static generateBonusAmount(): number {
        const a = Math.random();
        const b = Math.random();

        if (a < 0.7) {
            return Number((0.01 + b * 0.02).toFixed(2));
        }

        if (a < 0.9) {
            return Number((0.01 + b * 0.04).toFixed(2));
        }

        return Number((0.01 + b * 0.09).toFixed(2));
    }
}

export default BonusRepository;
