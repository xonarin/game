import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './BetPanelUPG.scss';
import { cn } from '../../../../utils/bem-css-module';
import { InventoryItemUpgFragment } from '../../../../__generated__/graphql';
import ItemCardUPG from '../ItemCardUPG/ItemCardUPG';
import CoinsUPG from '../CoinsUPG/CoinsUPG';
import { plural } from '../../format';

export interface BetPanelUPGProps {
    betItems: InventoryItemUpgFragment[];
    coins: number;
    betValue: number;
    /** Скины ставки сгорели в последней игре. */
    burned: boolean;
    /** Убрать скин из ставки (клик по нему). */
    onRemoveItem: (inventoryItemId: string) => void;
}

const cnBet = cn(s, 'BetPanelUPG');

// Сколько скинов показываем плиткой; остальные — «+N»
const VISIBLE_ITEMS = 4;

/** Левая верхняя панель: скины ставки (один — карточкой, несколько — плиткой) + монеты, итог ставки. */
const BetPanelUPG: React.FC<BetPanelUPGProps> = ({ betItems, coins, betValue, burned, onRemoveItem }) => {
    useStyles(s);

    const hidden = betItems.length - VISIBLE_ITEMS;

    const renderSlot = () => {
        if (betItems.length === 0) {
            return (
                <div className={cnBet('Placeholder')}>
                    {burned ? 'Скины сгорели' : 'Выберите скины в «Моих скинах»'}
                </div>
            );
        }
        if (betItems.length === 1) {
            const [only] = betItems;
            return <ItemCardUPG item={only.item} price={only.value} selected onClick={() => onRemoveItem(only.id)} />;
        }
        return (
            <div className={cnBet('Stack')}>
                {betItems.slice(0, VISIBLE_ITEMS).map((betItem, index) => (
                    <button
                        key={betItem.id}
                        type="button"
                        className={cnBet('Mini')}
                        title={`${betItem.item.name} — убрать из ставки`}
                        onClick={() => onRemoveItem(betItem.id)}
                    >
                        <img className={cnBet('MiniImage')} src={betItem.item.imageUrl} alt={betItem.item.name} />
                        {index === VISIBLE_ITEMS - 1 && hidden > 0 && <span className={cnBet('More')}>+{hidden}</span>}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <section className={cnBet({ burned })}>
            <div className={cnBet('Row')}>
                <div className={cnBet('Slot')}>{renderSlot()}</div>
                <div className={cnBet('Coins')}>
                    <span className={cnBet('CoinsTitle')}>Ставка</span>
                    {betItems.length > 1 && (
                        <span className={cnBet('Count')}>
                            {betItems.length} {plural(betItems.length, ['скин', 'скина', 'скинов'])}
                        </span>
                    )}
                    <span className={cnBet('CoinsValue')}>
                        <CoinsUPG amount={coins} />
                    </span>
                </div>
            </div>
            <div className={cnBet('Total')}>
                <CoinsUPG amount={betValue} size="l" />
            </div>
        </section>
    );
};

export default BetPanelUPG;
