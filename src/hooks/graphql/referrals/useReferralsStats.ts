import { useQuery } from '@apollo/client';

import {
    ReferralsStatsDocument,
    ReferralsStatsQuery,
    ReferralsStatsQueryVariables,
    RefStatsPeriod,
    RefStatsType,
} from '../../../__generated__/graphql';

interface ReferralsQueryResult {
    loading: boolean;
    mainValue?: ReferralsStatsQuery['referralsStats']['mainValue'];
    entries?: ReferralsStatsQuery['referralsStats']['entries'];
}

const useReferralsQuery = (type: RefStatsType, period: RefStatsPeriod): ReferralsQueryResult => {
    const { data, loading } = useQuery<ReferralsStatsQuery, ReferralsStatsQueryVariables>(ReferralsStatsDocument, {
        variables: { type, period },
    });

    return {
        loading,
        mainValue: data?.referralsStats.mainValue,
        entries: data?.referralsStats.entries,
    };
};

export default useReferralsQuery;