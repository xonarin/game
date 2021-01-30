import { useQuery } from '@apollo/client';

import {
    QiwiWithdrawStatsDocument,
    QiwiWithdrawStatsQuery,
    QiwiWithdrawStatsQueryVariables,
} from '../../../__generated__/graphql';

interface UseQiwiWithdrawStatsQueryResult {
    loading: boolean;
    qiwiWithdrawStats?: QiwiWithdrawStatsQuery['qiwiWithdrawStats'];
}

const useQiwiWithdrawStatsQuery = (): UseQiwiWithdrawStatsQueryResult => {
    const { loading, data } = useQuery<QiwiWithdrawStatsQuery, QiwiWithdrawStatsQueryVariables>(
        QiwiWithdrawStatsDocument,
        { fetchPolicy: 'cache-and-network' },
    );

    return {
        loading,
        qiwiWithdrawStats: data?.qiwiWithdrawStats,
    };
};

export default useQiwiWithdrawStatsQuery;
