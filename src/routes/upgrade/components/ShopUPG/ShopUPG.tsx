import React, { useMemo, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ShopUPG.scss';
import { cn } from '../../../../utils/bem-css-module';
import { ItemsSortUpg, ItemUpgFragment } from '../../../../__generated__/graphql';
import useItemsFilter from '../../../../hooks/useItemsFilter';
import useUpgradeItemsUPGQuery from '../../../../hooks/graphql/upgrade/useUpgradeItemsUPGQuery';
import useBuyItemsUPGMutation from '../../../../hooks/graphql/upgrade/useBuyItemsUPGMutation';
import ItemsToolbar from '../../../../components/ItemsToolbar/ItemsToolbar';
import Pagination from '../../../../components/ItemsToolbar/Pagination/Pagination';
import QuantityStepper from '../../../../components/ItemsToolbar/QuantityStepper/QuantityStepper';
import ItemsGridUPG from '../ItemsGridUPG/ItemsGridUPG';
import ItemCardUPG from '../ItemCardUPG/ItemCardUPG';
import CoinsUPG from '../CoinsUPG/CoinsUPG';

export interface ShopUPGProps {
    /** Шапка панели (вкладки «Мои скины / Магазин»). */
    head: React.ReactNode;
    balance: number;
    /** Сколько единиц можно купить за раз (сумма количеств) — upgradeConfigUPG.maxBuyUnits. */
    maxUnits: number;
}

const cnShop = cn(s, 'ShopUPG');

type Cart = Map<string, { item: ItemUpgFragment; quantity: number }>;

/**
 * Магазин: поиск, цена от/до, сортировка, страницы по 20; у каждого скина — количество.
 * Корзина живёт между страницами и фильтрами; всего не больше maxUnits единиц.
 */
const ShopUPG: React.FC<ShopUPGProps> = ({ head, balance, maxUnits }) => {
    useStyles(s);

    const filter = useItemsFilter({ pageSize: 20, defaultSort: 'asc' });
    const { items, total, loading } = useUpgradeItemsUPGQuery({
        search: filter.query.search || null,
        minPrice: filter.query.minPrice,
        maxPrice: filter.query.maxPrice,
        sort: filter.query.sort === 'asc' ? ItemsSortUpg.PriceAsc : ItemsSortUpg.PriceDesc,
        limit: filter.pageSize,
        offset: filter.query.offset,
    });
    const { buy, loading: buying } = useBuyItemsUPGMutation();

    const [cart, setCart] = useState<Cart>(new Map());
    const { units, cost } = useMemo(() => {
        let unitsSum = 0;
        let cents = 0;
        cart.forEach(({ item, quantity }) => {
            unitsSum += quantity;
            cents += Math.round(item.price * 100) * quantity;
        });
        return { units: unitsSum, cost: cents / 100 };
    }, [cart]);

    const setQuantity = (item: ItemUpgFragment, quantity: number) =>
        setCart(prev => {
            const next = new Map(prev);
            if (quantity > 0) next.set(item.id, { item, quantity });
            else next.delete(item.id);
            return next;
        });

    const notEnoughMoney = cost > balance;

    const onBuy = async () => {
        const response = await buy([...cart.values()].map(({ item, quantity }) => ({ itemId: item.id, quantity })));
        if (response?.data?.buyItemsUPG) setCart(new Map());
    };

    return (
        <ItemsGridUPG
            head={head}
            toolbar={<ItemsToolbar filter={filter} />}
            loading={loading || buying}
            empty={loading ? 'Загрузка…' : 'Ничего не найдено'}
            footer={
                <>
                    <Pagination page={filter.page} pageSize={filter.pageSize} total={total} onChange={filter.setPage} />
                    <div className={cnShop('Cart')}>
                        <span className={cnShop('Units', { full: units >= maxUnits })}>
                            Выбрано {units} из {maxUnits}
                        </span>
                        <span className={cnShop('Cost', { short: notEnoughMoney })}>
                            Итого <CoinsUPG amount={cost} size="s" />
                        </span>
                        <button
                            type="button"
                            className={cnShop('Clear')}
                            disabled={units === 0 || buying}
                            onClick={() => setCart(new Map())}
                        >
                            Очистить
                        </button>
                        <button
                            type="button"
                            className={cnShop('Buy')}
                            disabled={units === 0 || notEnoughMoney || buying}
                            title={notEnoughMoney ? 'Недостаточно монет' : undefined}
                            onClick={onBuy}
                        >
                            Купить
                        </button>
                    </div>
                </>
            }
        >
            {items.map(item => {
                const quantity = cart.get(item.id)?.quantity ?? 0;
                const selected = quantity > 0;
                // Клик выбирает скин (1 шт.) или снимает выбор; новый — только пока не набран лимит
                const canSelect = selected || units < maxUnits;
                return (
                    <ItemCardUPG
                        key={item.id}
                        item={item}
                        selected={selected}
                        onClick={canSelect ? () => setQuantity(item, selected ? 0 : 1) : undefined}
                        footer={
                            selected ? (
                                <QuantityStepper
                                    value={quantity}
                                    min={1}
                                    max={quantity + (maxUnits - units)}
                                    onChange={value => setQuantity(item, value)}
                                />
                            ) : undefined
                        }
                    />
                );
            })}
        </ItemsGridUPG>
    );
};

export default ShopUPG;
