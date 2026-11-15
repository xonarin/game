import { useQuery } from '@apollo/client';

import { UpgradeConfigUpgDocument, UpgradeConfigUpgQuery } from '../../../__generated__/graphql';

export type UpgradeConfigUPG = UpgradeConfigUpgQuery['upgradeConfigUPG'];

const useUpgradeConfigUPGQuery = (): { loading: boolean; config?: UpgradeConfigUPG } => {
    const { data, loading } = useQuery<UpgradeConfigUpgQuery>(UpgradeConfigUpgDocument, {
        fetchPolicy: 'cache-and-network',
    });

    return { loading, config: data?.upgradeConfigUPG };
};

export default useUpgradeConfigUPGQuery;
