import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './SearchInput.scss';
import { cn } from '../../../utils/bem-css-module';

export interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const cnSearch = cn(s, 'SearchInput');

/** Поле поиска с кнопкой очистки. Задержку запросов (debounce) делает вызывающий — см. useItemsFilter. */
const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = 'Поиск', className }) => {
    useStyles(s);

    return (
        <div className={cnSearch(null, [className])}>
            <input
                className={cnSearch('Input')}
                type="search"
                value={value}
                placeholder={placeholder}
                aria-label={placeholder}
                maxLength={100}
                onChange={event => onChange(event.target.value)}
            />
            {value && (
                <button type="button" className={cnSearch('Clear')} onClick={() => onChange('')} aria-label="Очистить">
                    ×
                </button>
            )}
        </div>
    );
};

export default SearchInput;
