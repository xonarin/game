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
    payments?: Payment[];
    withdraws?: Withdraw[];
}

const usePaymentsAndWithdrawsQuery = (): UsePaymentsAndWithdrawsQueryResult => {
    const { loading, data } = useQuery<PaymentsAndWithdrawsQuery, PaymentsAndWithdrawsQueryVariables>(
        PaymentsAndWithdrawsDocument,
    );

    return {
        loading,
        payments: data?.payments,
        withdraws: data?.withdraws,
    };
};

export default usePaymentsAndWithdrawsQuery;
