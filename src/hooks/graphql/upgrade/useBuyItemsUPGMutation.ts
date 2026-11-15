import { useCallback } from 'react';
import { FetchResult } from '@apollo/client';

import {
    BuyItemsUpgDocument,
    BuyItemsUpgMutation,
    BuyItemsUpgMutationVariables,
    BuyItemUpgInput,
    InventoryUpgDocument,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';

export interface UseBuyItemsUPGMutationResult {
    buy: (items: BuyItemUpgInput[]) => Promise<FetchResult<BuyItemsUpgMutation> | undefined>;
    loading: boolean;
}

/** Покупка нескольких скинов одной операцией; инвентарь перечитывается. */
const useBuyItemsUPGMutation = (): UseBuyItemsUPGMutationResult => {
    const [buyItems, { loading }] = useMutationWithNotify<BuyItemsUpgMutation, BuyItemsUpgMutationVariables>(
        BuyItemsUpgDocument,
        { refetchQueries: [{ query: InventoryUpgDocument }] },
    );

    const buy = useCallback((items: BuyItemUpgInput[]) => buyItems({ variables: { items } }), [buyItems]);

    return { buy, loading };
};

export default useBuyItemsUPGMutation;
