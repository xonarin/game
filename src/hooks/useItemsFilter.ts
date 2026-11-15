import { useEffect, useState } from 'react';

import { SortDirection } from '../components/ItemsToolbar/SortToggle/SortToggle';
import { parsePriceBound } from '../components/ItemsToolbar/PriceRangeFilter/PriceRangeFilter';

export interface ItemsFilterState {
    /** Строка поиска как вводит пользователь (для поля). */
    search: string;
    setSearch: (value: string) => void;
    /** Цена от/до как ввёл пользователь (для полей). */
    price: { min: string; max: string };
    setPrice: (range: { min: string; max: string }) => void;
    sort: SortDirection;
    setSort: (value: SortDirection) => void;
    page: number;
    setPage: (page: number) => void;
    pageSize: number;
    /** Значения для запроса: поиск с задержкой, границы цены числами (null — без границы). */
    query: { search: string; minPrice: number | null; maxPrice: number | null; sort: SortDirection; offset: number };
}

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Состояние фильтров списка предметов: поиск, цена от/до, сортировка, страница.
 * Любое изменение фильтров возвращает на первую страницу. defaultSort — направление, пока пользователь
 * сам не выбрал (может меняться: например, «дорогие первыми», пока нет ставки).
 */
const useItemsFilter = ({ pageSize = 20, defaultSort = 'asc' as SortDirection } = {}): ItemsFilterState => {
    const [search, setSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [price, setPriceValue] = useState({ min: '', max: '' });
    const [chosenSort, setChosenSort] = useState<SortDirection | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [search]);

    const sort = chosenSort ?? defaultSort;

    // Новый фильтр — с первой страницы (поиск — когда сработает задержка)
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, price.min, price.max, sort]);

    return {
        search,
        setSearch: setSearchValue,
        price,
        setPrice: setPriceValue,
        sort,
        setSort: setChosenSort,
        page,
        setPage,
        pageSize,
        query: {
            search: debouncedSearch,
            minPrice: parsePriceBound(price.min),
            maxPrice: parsePriceBound(price.max),
            sort,
            offset: (page - 1) * pageSize,
        },
    };
};

export default useItemsFilter;
