import { useQuery } from '@apollo/client';

import {
    ItemUpgFragment,
    UpgradeItemUpgDocument,
    UpgradeItemUpgQuery,
    UpgradeItemUpgQueryVariables,
} from '../../../__generated__/graphql';

/**
 * Текущая цена одного предмета (выбранной цели). undefined — ещё не загружено, null — снят с продажи.
 */
const useUpgradeItemUPGQuery = (
    id: string | null,
): { item: ItemUpgFragment | null | undefined; refetch: () => void } => {
    const { data, refetch } = useQuery<UpgradeItemUpgQuery, UpgradeItemUpgQueryVariables>(UpgradeItemUpgDocument, {
        variables: { id: id ?? '' },
        skip: !id,
        fetchPolicy: 'cache-and-network',
    });

    return {
        item: data ? data.upgradeItemUPG : undefined,
        refetch: () => {
            if (id) refetch().then();
        },
    };
};

export default useUpgradeItemUPGQuery;
