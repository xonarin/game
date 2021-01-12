import { useQuery } from '@apollo/client';

import {
    AvailablePaymentAndWithdrawMethodsDocument,
    AvailablePaymentAndWithdrawMethodsQuery,
    AvailablePaymentAndWithdrawMethodsQueryVariables,
} from '../../../__generated__/graphql';

interface AvailablePaymentAndWithdrawMethodsQueryResult {
    loading: boolean;
    availablePaymentMethods?: AvailablePaymentAndWithdrawMethodsQuery['availablePaymentMethods'];
    availableWithdrawMethods?: AvailablePaymentAndWithdrawMethodsQuery['availableWithdrawMethods'];
}

const useAvailablePaymentAndWithdrawMethodsQuery = (): AvailablePaymentAndWithdrawMethodsQueryResult => {
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
