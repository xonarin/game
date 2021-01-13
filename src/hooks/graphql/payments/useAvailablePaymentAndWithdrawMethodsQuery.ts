import { useQuery } from '@apollo/client';

import {
    AvailablePaymentAndWithdrawMethodsDocument,
    AvailablePaymentAndWithdrawMethodsQuery,
    AvailablePaymentAndWithdrawMethodsQueryVariables,
    PaymentMethod,
    WithdrawMethod,
} from '../../../__generated__/graphql';

interface UseAvailablePaymentAndWithdrawMethodsQueryResult {
    loading: boolean;
    availablePaymentMethods?: PaymentMethod[];
    availableWithdrawMethods?: WithdrawMethod[];
}

const useAvailablePaymentAndWithdrawMethodsQuery = (): UseAvailablePaymentAndWithdrawMethodsQueryResult => {
    const { loading, data } = useQuery<
        AvailablePaymentAndWithdrawMethodsQuery,
        AvailablePaymentAndWithdrawMethodsQueryVariables
    >(AvailablePaymentAndWithdrawMethodsDocument);

    return {
        loading,
        availablePaymentMethods: data?.availablePaymentMethods,
        availableWithdrawMethods: data?.availableWithdrawMethods,
    };
};

export default useAvailablePaymentAndWithdrawMethodsQuery;
