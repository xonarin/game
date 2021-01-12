import { useQuery } from '@apollo/client';

import { ReferralsDocument, ReferralsQuery, ReferralsQueryVariables } from '../../../__generated__/graphql';

interface ReferralsQueryResult {
    loading: boolean;
    referrals: ReferralsQuery['referrals']['items'];
}

const useReferralsQuery = (): ReferralsQueryResult => {
    const { data, loading } = useQuery<ReferralsQuery, ReferralsQueryVariables>(ReferralsDocument);

    return {
        loading,
        referrals: data?.referrals.items || [],
    };
};

export default useReferralsQuery;
