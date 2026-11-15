import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ItemsToolbar.scss';
import { cn } from '../../utils/bem-css-module';
import { ItemsFilterState } from '../../hooks/useItemsFilter';
import SearchInput from './SearchInput/SearchInput';
import PriceRangeFilter from './PriceRangeFilter/PriceRangeFilter';
import SortToggle from './SortToggle/SortToggle';

export interface ItemsToolbarProps {
    filter: ItemsFilterState;
    searchPlaceholder?: string;
    className?: string;
}

const cnToolbar = cn(s, 'ItemsToolbar');

/** Панель фильтров списка предметов: сортировка по цене, поиск по названию, цена от/до. Состояние — useItemsFilter. */
const ItemsToolbar: React.FC<ItemsToolbarProps> = ({ filter, searchPlaceholder = 'Поиск по названию', className }) => {
    useStyles(s);

    return (
        <div className={cnToolbar(null, [className])}>
            <SortToggle value={filter.sort} onChange={filter.setSort} />
            <SearchInput
                className={cnToolbar('Search')}
                value={filter.search}
                onChange={filter.setSearch}
                placeholder={searchPlaceholder}
            />
            <PriceRangeFilter min={filter.price.min} max={filter.price.max} onChange={filter.setPrice} />
        </div>
    );
};

export default ItemsToolbar;
