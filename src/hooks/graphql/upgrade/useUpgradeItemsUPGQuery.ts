import { useQuery } from '@apollo/client';

import {
    ItemsFilterUpg,
    ItemUpgFragment,
    UpgradeItemsUpgDocument,
    UpgradeItemsUpgQuery,
    UpgradeItemsUpgQueryVariables,
} from '../../../__generated__/graphql';

export interface UseUpgradeItemsUPGQueryResult {
    loading: boolean;
    items: ItemUpgFragment[];
    /** Сколько всего предметов подходит под фильтр (для пагинации). */
    total: number;
    refetch: () => void;
}

/** Страница предметов (магазин и цели апгрейда): поиск, цена от/до, сортировка, limit/offset. */
const useUpgradeItemsUPGQuery = (
    filter: ItemsFilterUpg,
    { skip = false }: { skip?: boolean } = {},
): UseUpgradeItemsUPGQueryResult => {
    const { data, loading, previousData, refetch } = useQuery<UpgradeItemsUpgQuery, UpgradeItemsUpgQueryVariables>(
        UpgradeItemsUpgDocument,
        { variables: { filter }, skip },
    );

    // Пока грузится новая страница — показываем прежнюю, без мигания пустой сетки
    const page = (data ?? previousData)?.upgradeItemsUPG;
    return {
        loading,
        items: page?.items ?? [],
        total: page?.total ?? 0,
        refetch: () => {
            if (!skip) refetch().then();
        },
    };
};

export default useUpgradeItemsUPGQuery;
