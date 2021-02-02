import { QueryResult, useQuery } from '@apollo/client';

import {
    QiwiWithdrawStatsDocument,
    QiwiWithdrawStatsQuery,
    QiwiWithdrawStatsQueryVariables,
} from '../../../__generated__/graphql';

interface UseQiwiWithdrawStatsQueryResult {
    loading: boolean;
    qiwiWithdrawStats?: QiwiWithdrawStatsQuery['qiwiWithdrawStats'];
    refetch: QueryResult<QiwiWithdrawStatsQuery, QiwiWithdrawStatsQueryVariables>['refetch'];
}

const useQiwiWithdrawStatsQuery = (): UseQiwiWithdrawStatsQueryResult => {
    const { loading, data, refetch } = useQuery<QiwiWithdrawStatsQuery, QiwiWithdrawStatsQueryVariables>(
        QiwiWithdrawStatsDocument,
        { notifyOnNetworkStatusChange: true },
    );

    return {
        loading,
        qiwiWithdrawStats: data?.qiwiWithdrawStats,
        refetch,
    };
};

export default useQiwiWithdrawStatsQuery;
