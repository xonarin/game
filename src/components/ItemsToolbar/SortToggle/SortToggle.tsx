import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './SortToggle.scss';
import { cn } from '../../../utils/bem-css-module';

export type SortDirection = 'asc' | 'desc';

export interface SortToggleProps {
    value: SortDirection;
    onChange: (value: SortDirection) => void;
    /** Что сортируем — для подсказки: «Цена». */
    label?: string;
    className?: string;
}

const cnSort = cn(s, 'SortToggle');

/** Переключатель направления сортировки: по возрастанию ↔ по убыванию. */
const SortToggle: React.FC<SortToggleProps> = ({ value, onChange, label = 'Цена', className }) => {
    useStyles(s);

    const title = `${label}: ${value === 'asc' ? 'по возрастанию' : 'по убыванию'}`;

    return (
        <button
            type="button"
            className={cnSort({ direction: value }, [className])}
            onClick={() => onChange(value === 'asc' ? 'desc' : 'asc')}
            title={title}
            aria-label={title}
        >
            <span className={cnSort('Arrow', { up: true })}>▲</span>
            <span className={cnSort('Arrow', { down: true })}>▼</span>
        </button>
    );
};

export default SortToggle;
