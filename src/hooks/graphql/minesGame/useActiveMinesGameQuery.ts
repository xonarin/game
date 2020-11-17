import { useQuery } from '@apollo/client';

import { ActiveMinesGameDocument, ActiveMinesGameQuery } from '../../../__generated__/graphql';

export interface UseActiveMinesGameQueryResult {
    loading: boolean;
    activeMinesGame?: ActiveMinesGameQuery['activeMinesGame'];
}

const useActiveMinesGameQuery = (): UseActiveMinesGameQueryResult => {
    const { data, loading } = useQuery<ActiveMinesGameQuery>(ActiveMinesGameDocument);

    return {
        loading,
        activeMinesGame: data?.activeMinesGame,
    };
};

export default useActiveMinesGameQuery;
