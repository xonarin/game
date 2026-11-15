import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './PriceRangeFilter.scss';
import { cn } from '../../../utils/bem-css-module';

export interface PriceRangeFilterProps {
    /** Значения полей как ввёл пользователь ('' — без границы). */
    min: string;
    max: string;
    onChange: (range: { min: string; max: string }) => void;
    className?: string;
}

const cnRange = cn(s, 'PriceRangeFilter');

// Только цифры и одна точка/запятая, до 2 знаков после неё
const sanitize = (value: string) => {
    const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
    const [int, ...rest] = normalized.split('.');
    return rest.length ? `${int}.${rest.join('').slice(0, 2)}` : int;
};

/** Фильтр цены «от — до». Разбор строк в числа — parsePriceBound. */
const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({ min, max, onChange, className }) => {
    useStyles(s);

    return (
        <div className={cnRange(null, [className])}>
            <input
                className={cnRange('Input')}
                inputMode="decimal"
                value={min}
                placeholder="от"
                aria-label="Цена от"
                onChange={event => onChange({ min: sanitize(event.target.value), max })}
            />
            <input
                className={cnRange('Input')}
                inputMode="decimal"
                value={max}
                placeholder="до"
                aria-label="Цена до"
                onChange={event => onChange({ min, max: sanitize(event.target.value) })}
            />
        </div>
    );
};

/** '' или не число — границы нет (null). */
export const parsePriceBound = (value: string): number | null => {
    if (value.trim() === '') return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : null;
};

export default PriceRangeFilter;
