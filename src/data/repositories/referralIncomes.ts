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

    async getIncomeStats(referrerId: string, period: RefStatsPeriod): Promise<GraphDataEntry[]> {
        const startDateTime = DateTime.local()
            .startOf(ReferralIncomesRepository.periodMapping[period])
            .toSQL();
        const extractFunction = period === RefStatsPeriod.Year ? 'MONTH' : 'DAY';

        return this.db.ReferralIncome.findAll({
            attributes: [
                [fn(extractFunction, col('createdAt')), 'key'],
                [fn('SUM', col('amount')), 'value'],
            ],
            where: {
                referrerId,
                createdAt: { [Op.gte]: startDateTime },
            },
            group: col('key'),
        });
    }
}

export default ReferralIncomesRepository;
