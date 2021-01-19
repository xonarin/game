import { useQuery } from '@apollo/client';
import { useCallback } from 'react';

import { HasBonusDocument, HasBonusQuery, HasBonusQueryVariables } from '../../../__generated__/graphql';

interface UseHasBonusQueryResult {
    loading: boolean;
    refetchHasBonus: () => Promise<void>;
    hasBonus?: boolean;
}

const useHasBonusQuery = (): UseHasBonusQueryResult => {
    const { loading, data, refetch } = useQuery<HasBonusQuery, HasBonusQueryVariables>(HasBonusDocument, {
        fetchPolicy: 'cache-and-network',
    });

    const refetchHasBonus = useCallback(async () => {
        await refetch();
    }, [refetch]);

    return {
        loading,
        refetchHasBonus,
        hasBonus: data?.hasBonus,
    };
};

export default useHasBonusQuery;
