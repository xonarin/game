import { useQuery } from '@apollo/client';

import {
    ReferralsStatsDocument,
    ReferralsStatsQuery,
    ReferralsStatsQueryVariables,
    RefStatsPeriod,
    RefStatsType,
} from '../../../__generated__/graphql';

interface UseReferralsStatsQueryResult {
    loading: boolean;
    fullAmount?: ReferralsStatsQuery['referralsStats']['fullAmount'];
    mainValue?: ReferralsStatsQuery['referralsStats']['mainValue'];
    entries?: ReferralsStatsQuery['referralsStats']['entries'];
}

const useReferralsStatsQuery = (type: RefStatsType, period: RefStatsPeriod): UseReferralsStatsQueryResult => {
    const { data, loading } = useQuery<ReferralsStatsQuery, ReferralsStatsQueryVariables>(ReferralsStatsDocument, {
        variables: { type, period },
    });

    return {
        loading,
        fullAmount: data?.referralsStats.fullAmount,
        mainValue: data?.referralsStats.mainValue,
        entries: data?.referralsStats.entries,
    };
};

export default useReferralsStatsQuery;
