import { useQuery } from '@apollo/client';

import { MeDocument, MeQuery } from '../../../__generated__/graphql';

export interface UseMeQueryResult {
    loading: boolean;
    me?: MeQuery['me'];
}

const useMeQuery = (): UseMeQueryResult => {
    const { data, loading } = useQuery<MeQuery>(MeDocument);

    return {
        loading,
        me: data && data.me,
    };
};

export default useMeQuery;
