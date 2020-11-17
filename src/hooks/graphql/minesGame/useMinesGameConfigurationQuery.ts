import { useQuery } from '@apollo/client';

import { MinesGameConfigurationDocument, MinesGameConfigurationQuery } from '../../../__generated__/graphql';

export interface UseMinesGameConfigurationResult {
    loading: boolean;
    minesGameConfiguration?: MinesGameConfigurationQuery['minesGameConfiguration'];
}

const useMinesGameConfigurationQuery = (): UseMinesGameConfigurationResult => {
    const { data, loading } = useQuery<MinesGameConfigurationQuery>(MinesGameConfigurationDocument);

    return {
        loading,
        minesGameConfiguration: data?.minesGameConfiguration,
    };
};

export default useMinesGameConfigurationQuery;
