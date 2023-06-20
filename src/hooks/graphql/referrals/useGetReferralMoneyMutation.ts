import {
    GetReferralMoneyDocument,
    GetReferralMoneyMutation,
    GetReferralMoneyMutationVariables,
    ReferralsStatsDocument,
    ReferralsStatsQuery,
    ReferralsStatsQueryVariables,
    RefStatsPeriod,
    RefStatsType,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';

const useGetReferralMoneyMutation = () => {
    const [getReferralMoney] = useMutationWithNotify<GetReferralMoneyMutation, GetReferralMoneyMutationVariables>(
        GetReferralMoneyDocument,
        {
            update: (cache, { data }) => {
                if (!data) {
                    return;
                }

                const { getReferralMoney: fullAmount } = data;

                Object.values(RefStatsPeriod).forEach(period => {
                    const query = { query: ReferralsStatsDocument, variables: { type: RefStatsType.Income, period } };

                    try {
                        const queryData = cache.readQuery<ReferralsStatsQuery, ReferralsStatsQueryVariables>(query);

                        if (queryData) {
                            const { referralsStats } = queryData;

                            cache.writeQuery<ReferralsStatsQuery, ReferralsStatsQueryVariables>({
                                ...query,
                                data: { referralsStats: { ...referralsStats, fullAmount } },
                            });
                        }
                    } catch (e) {
                        // suppress
                    }
                });
            },
        },
    );

    return () => getReferralMoney();
};

export default useGetReferralMoneyMutation;
