import { useQuery } from '@apollo/client';

import {
    Payment,
    PaymentsAndWithdrawsDocument,
    PaymentsAndWithdrawsQuery,
    PaymentsAndWithdrawsQueryVariables,
    Withdraw,
} from '../../../__generated__/graphql';

interface UsePaymentsAndWithdrawsQueryResult {
    loading: boolean;
    refetch: () => Promise<unknown>;
    payments?: Payment[];
    withdraws?: Withdraw[];
}

const usePaymentsAndWithdrawsQuery = (): UsePaymentsAndWithdrawsQueryResult => {
    const { loading, refetch, data } = useQuery<PaymentsAndWithdrawsQuery, PaymentsAndWithdrawsQueryVariables>(
        PaymentsAndWithdrawsDocument,
    );

    return {
        loading,
        refetch,
        payments: data?.payments,
        withdraws: data?.withdraws,
    };
};

export default usePaymentsAndWithdrawsQuery;
