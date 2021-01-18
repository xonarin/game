import { useQuery } from '@apollo/client';

import {
    UsersTotalAndPayedTotalDocument,
    UsersTotalAndPayedTotalQuery,
    UsersTotalAndPayedTotalQueryVariables,
} from '../../__generated__/graphql';

interface UseUsersTotalAndPayedTotalQueryResult {
    loading: boolean;
    usersTotal?: number;
    payedTotal?: number;
}

const useUsersTotalAndPayedTotalQuery = (): UseUsersTotalAndPayedTotalQueryResult => {
    const { loading, data } = useQuery<UsersTotalAndPayedTotalQuery, UsersTotalAndPayedTotalQueryVariables>(
        UsersTotalAndPayedTotalDocument,
    );

    return {
        loading,
        usersTotal: data?.usersTotal,
        payedTotal: data?.payedTotal,
    };
};

export default useUsersTotalAndPayedTotalQuery;
