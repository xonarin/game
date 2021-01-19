import { DateTime } from 'luxon';

import BaseRepository from './base';
import { Bonus } from '../models/Bonus';
import { UserError } from '../../utils/errors';
import KeyLocker from '../../utils/keyLocker';

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
                return false;
            }

            const bets = await this.repositories.users.sumBetsAmountFrom(userId, lastBonus.createdAt);
            if (bets < lastBonus.amount) {
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
                const hasBonus = this.hasBonus(userId);

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

    static generateBonusAmount(): number {
        const a = Math.random();
        const b = Math.random();

        if (a < 0.7) {
            return Number((b * 0.03).toFixed(2));
        }

        if (a < 0.9) {
            return Number((b * 0.05).toFixed(2));
        }

        return Number((b * 0.1).toFixed(2));
    }
}

export default BonusRepository;
