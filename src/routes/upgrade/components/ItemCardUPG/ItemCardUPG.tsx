import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ItemCardUPG.scss';
import { cn } from '../../../../utils/bem-css-module';
import { ItemUpgFragment } from '../../../../__generated__/graphql';
import CoinsUPG from '../CoinsUPG/CoinsUPG';

export interface ItemCardUPGProps {
    item: ItemUpgFragment;
    /** Цена на карточке; по умолчанию — цена предмета. */
    price?: number;
    selected?: boolean;
    size?: 's' | 'l';
    onClick?: () => void;
    /** Действие под карточкой (например, «Купить»). */
    footer?: React.ReactNode;
    className?: string;
}

const cnItemCard = cn(s, 'ItemCardUPG');

/** «Weapon | Skin (Field-Tested)» → { title: 'Skin', subtitle: 'Weapon' }. */
const splitName = (name: string): { title: string; subtitle: string } => {
    const clean = name.replace(/\s*\([^)]*\)\s*$/, '');
    const [subtitle, ...rest] = clean.split(' | ');
    return rest.length ? { title: rest.join(' | '), subtitle } : { title: clean, subtitle: '' };
};

/** Карточка скина: цена, износ, картинка, название. Переиспользуется в инвентаре, магазине и выборе цели. */
const ItemCardUPG: React.FC<ItemCardUPGProps> = ({ item, price, selected, size = 's', onClick, footer, className }) => {
    useStyles(s);

    const { title, subtitle } = splitName(item.name);
    const style = item.rarityColor ? ({ '--rarity': item.rarityColor } as React.CSSProperties) : undefined;

    return (
        <div
            className={cnItemCard({ size, selected: Boolean(selected), clickable: Boolean(onClick) }, [className])}
            style={style}
        >
            <button type="button" className={cnItemCard('Body')} onClick={onClick} disabled={!onClick}>
                <span className={cnItemCard('Top')}>
                    <span className={cnItemCard('Exterior')}>{item.exterior ?? ''}</span>
                    <CoinsUPG amount={price ?? item.price} size={size === 'l' ? 'l' : 's'} />
                </span>
                <img className={cnItemCard('Image')} src={item.imageUrl} alt={item.name} loading="lazy" />
                <span className={cnItemCard('Subtitle')}>{subtitle}</span>
                <span className={cnItemCard('Title')} title={item.name}>
                    {title}
                </span>
            </button>
            {footer && <div className={cnItemCard('Footer')}>{footer}</div>}
        </div>
    );
};

export default ItemCardUPG;
