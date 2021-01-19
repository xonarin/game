import { DateTime } from 'luxon';
import { UniqueConstraintError } from 'sequelize';

import BaseRepository from './base';
import { Bonus } from '../models/Bonus';
import { UserError } from '../../utils/errors';
import KeyLocker from '../../utils/keyLocker';
import { PromoCode } from '../models/PromoCode';
import { PaymentStatus } from '../models/UserPayment';

const promoCodeRegExp = /^\w{4,255}$/;

class BonusRepository extends BaseRepository {
    private getBonusLocker = new KeyLocker<string>();

    async hasBonus(userId: string): Promise<boolean> {
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
                // console.log('has no bonuse due to minutes', minutesFromLastBonus);
                return false;
            }

            const bets = await this.repositories.users.sumBetsAmountFrom(userId, lastBonus.createdAt);
            if (bets < lastBonus.amount) {
                // console.log('has no bonuse due to bets', bets);
                return false;
            }
        }

        // TODO check vk

        return true;
    }

    async getBonus(userId: string): Promise<number> {
        return this.getBonusLocker.use(userId, async locker => {
            await locker.lock();

            try {
                const hasBonus = await this.hasBonus(userId);

                if (!hasBonus) {
                    throw new UserError('HAS_NO_BONUS');
                }

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

    async usePromoCode(userId: string, code: string): Promise<PromoCode> {
        // TODO

        throw new UserError('NOT_IMPLEMENTED');
    }

    async createPromoCode(userId: string, code: string, amount: number, maxUses: number): Promise<PromoCode> {
        if (code.match(promoCodeRegExp) === null) {
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

        const fixedCode = code.toUpperCase();
        return this.db.sequelize.transaction(async transaction => {
            try {
                const promoCode = await this.db.PromoCode.create(
                    { code: fixedCode, userId, amount, maxUses },
                    { transaction },
                );

                const cost = promoCode.amount * promoCode.maxUses;
                await this.repositories.users.withdrawMoney(userId, cost, transaction);

                return promoCode;
            } catch (e) {
                if (e instanceof UniqueConstraintError) {
                    throw new UserError('PROMO_CODE_BUSIED');
                }

                throw e;
            }
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
