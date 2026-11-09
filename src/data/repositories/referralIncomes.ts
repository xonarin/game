import { col, fn, Op, Transaction } from 'sequelize';
import { DateTime, DateTimeUnit } from 'luxon';

import BaseRepository from './base';
import { ReferralIncome } from '../models/ReferralIncome';
import { GraphDataEntry, RefStatsPeriod } from '../../__generated__/graphql';

class ReferralIncomesRepository extends BaseRepository {
    static periodMapping: Record<RefStatsPeriod, DateTimeUnit> = {
        [RefStatsPeriod.Week]: 'week',
        [RefStatsPeriod.Month]: 'month',
        [RefStatsPeriod.Year]: 'year',
    };

    async writeIncome(
        referrerId: string,
        referralId: string,
        amount: number,
        transaction?: Transaction,
    ): Promise<ReferralIncome> {
        return this.db.ReferralIncome.create(
            {
                referrerId,
                referralId,
                amount,
            },
            { transaction },
        );
    }

    async getTopUserId(start: Date, finish: Date): Promise<{ referrerId: string; value: number } | null> {
        // raw aggregate row, not a model instance
        return (this.db.ReferralIncome.findOne({
            attributes: ['referrerId', [fn('SUM', col('amount')), 'value']],
            where: {
                createdAt: { [Op.between]: [start, finish] },
            },
            group: col('referrerId'),
            order: [[col('value'), 'DESC']],
            limit: 1,
            raw: true,
        }) as unknown) as Promise<{ referrerId: string; value: number } | null>;
    }

    async getIncomeStats(referrerId: string, period: RefStatsPeriod): Promise<GraphDataEntry[]> {
        const startDateTime = DateTime.local()
            .startOf(ReferralIncomesRepository.periodMapping[period])
            .toSQL();
        const format = period === RefStatsPeriod.Year ? '15.%m.%Y' : '%d.%m.%Y';

        // raw aggregate rows, not model instances
        const rows = await this.db.ReferralIncome.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('createdAt'), format), 'date'],
                [fn('SUM', col('amount')), 'value'],
            ],
            where: {
                referrerId,
                createdAt: { [Op.gte]: startDateTime },
            },
            group: col('date'),
            raw: true,
        });
        return (rows as unknown) as GraphDataEntry[];
    }
}

export default ReferralIncomesRepository;
