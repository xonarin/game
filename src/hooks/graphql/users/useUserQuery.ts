import { useQuery } from '@apollo/client';

import { UserDocument, UserQuery, UserQueryVariables } from '../../../__generated__/graphql';

export interface UseUserQueryResult {
    loading: boolean;
    user?: UserQuery['user'];
}

const useUserQuery = (userId: string): UseUserQueryResult => {
    const { data, loading } = useQuery<UserQuery, UserQueryVariables>(UserDocument, { variables: { userId } });

    return {
        loading,
        user: data?.user,
    };
};

export default useUserQuery;
