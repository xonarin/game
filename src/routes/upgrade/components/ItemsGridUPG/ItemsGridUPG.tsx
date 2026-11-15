import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ItemsGridUPG.scss';
import { cn } from '../../../../utils/bem-css-module';

export interface ItemsGridUPGProps {
    head: React.ReactNode;
    /** Панель под шапкой: фильтры, поиск, сортировка. */
    toolbar?: React.ReactNode;
    /** Подвал: пагинация, корзина. */
    footer?: React.ReactNode;
    loading?: boolean;
    empty?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

const cnGrid = cn(s, 'ItemsGridUPG');

/** Панель со шапкой и сеткой карточек: инвентарь, магазин, выбор цели. */
const ItemsGridUPG: React.FC<ItemsGridUPGProps> = ({ head, toolbar, footer, loading, empty, children, className }) => {
    useStyles(s);

    const hasItems = React.Children.count(children) > 0;

    return (
        <section className={cnGrid(null, [className])}>
            <header className={cnGrid('Head')}>{head}</header>
            {toolbar && <div className={cnGrid('Toolbar')}>{toolbar}</div>}
            <div className={cnGrid('Body', { loading: Boolean(loading) })}>
                {hasItems ? (
                    <div className={cnGrid('Grid')}>{children}</div>
                ) : (
                    <div className={cnGrid('Empty')}>{empty}</div>
                )}
            </div>
            {footer && <footer className={cnGrid('Footer')}>{footer}</footer>}
        </section>
    );
};

export default ItemsGridUPG;
