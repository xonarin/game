import { useQuery } from '@apollo/client';

import { InventoryItemUpgFragment, InventoryUpgDocument, InventoryUpgQuery } from '../../../__generated__/graphql';

/** Инвентарь со стоимостью скинов по текущим ценам; refetch — перечитать цены (например, после отказа сервера). */
const useInventoryUPGQuery = (): {
    loading: boolean;
    inventory: InventoryItemUpgFragment[];
    refetch: () => void;
} => {
    const { data, loading, refetch } = useQuery<InventoryUpgQuery>(InventoryUpgDocument, {
        fetchPolicy: 'cache-and-network',
    });

    return {
        loading,
        inventory: data?.inventoryUPG ?? [],
        refetch: () => {
            refetch().then();
        },
    };
};

export default useInventoryUPGQuery;
