import { useQuery } from '@apollo/client';

import { ReferralLinkDocument, ReferralLinkQuery, ReferralLinkQueryVariables } from '../../../__generated__/graphql';

const useReferralLinkQuery = (domain: string) => {
    const { data, loading } = useQuery<ReferralLinkQuery, ReferralLinkQueryVariables>(ReferralLinkDocument, {
        variables: { domain },
    });

    return {
        loading,
        referralLink: data?.referralLink,
    };
};

export default useReferralLinkQuery;
