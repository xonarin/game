import { QueryResult, useQuery } from '@apollo/client';

import {
    ReferralsStatsDocument,
    ReferralsStatsQuery,
    ReferralsStatsQueryVariables,
    RefStatsPeriod,
    RefStatsType,
} from '../../../__generated__/graphql';

interface UseReferralsStatsQueryResult {
    loading: boolean;
    refetch: QueryResult<ReferralsStatsQuery, ReferralsStatsQueryVariables>['refetch'];
    fullAmount?: ReferralsStatsQuery['referralsStats']['fullAmount'];
    mainValue?: ReferralsStatsQuery['referralsStats']['mainValue'];
    entries?: ReferralsStatsQuery['referralsStats']['entries'];
}

const useReferralsStatsQuery = (type: RefStatsType, period: RefStatsPeriod): UseReferralsStatsQueryResult => {
    const { data, loading, refetch } = useQuery<ReferralsStatsQuery, ReferralsStatsQueryVariables>(
        ReferralsStatsDocument,
        { variables: { type, period } },
    );

    return {
        loading,
        refetch,
        fullAmount: data?.referralsStats.fullAmount,
        mainValue: data?.referralsStats.mainValue,
        entries: data?.referralsStats.entries,
    };
};

export default useReferralsStatsQuery;
