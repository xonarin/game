import { useQuery } from '@apollo/client';

import { HasBonusDocument, HasBonusQuery, HasBonusQueryVariables } from '../../../__generated__/graphql';

interface UseHasBonusQueryResult {
    loading: boolean;
    hasBonus?: boolean;
}

const useHasBonusQuery = (): UseHasBonusQueryResult => {
    const { loading, data } = useQuery<HasBonusQuery, HasBonusQueryVariables>(HasBonusDocument);

    return {
        loading,
        hasBonus: data?.hasBonus,
    };
};

export default useHasBonusQuery;
