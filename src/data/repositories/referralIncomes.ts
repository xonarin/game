import { col, fn, Op, Transaction } from 'sequelize';
import { DateTime, DurationUnit } from 'luxon';

import BaseRepository from './base';
import { ReferralIncome } from '../models/ReferralIncome';
import { GraphDataEntry, RefStatsPeriod } from '../../__generated__/graphql';

class ReferralIncomesRepository extends BaseRepository {
    static periodMapping: Record<RefStatsPeriod, DurationUnit> = {
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
        return this.db.ReferralIncome.findOne({
            attributes: ['referrerId', [fn('SUM', col('amount')), 'value']],
            where: {
                createdAt: { [Op.between]: [start, finish] },
            },
            group: col('referrerId'),
            order: [[col('value'), 'DESC']],
            limit: 1,
            raw: true,
        });
    }

    async getIncomeStats(referrerId: string, period: RefStatsPeriod): Promise<GraphDataEntry[]> {
        const startDateTime = DateTime.local()
            .startOf(ReferralIncomesRepository.periodMapping[period])
            .toSQL();
        const format = period === RefStatsPeriod.Year ? '15.%m.%Y' : '%d.%m.%Y';

        return this.db.ReferralIncome.findAll({
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
    }
}

export default ReferralIncomesRepository;
