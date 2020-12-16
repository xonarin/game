import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { debounce } from 'lodash';
import { FieldInputProps } from 'react-final-form';

import s from './SearchInput.scss';
import { cn } from '../../../../../utils/bem-css-module';
import Icon from '../../../../Icon/Icon';

export interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onFocus?: FieldInputProps<unknown>['onFocus'];
    onBlur?: FieldInputProps<unknown>['onBlur'];
    onSubmit: () => void;
}

const cnSearchInput = cn(s, 'SearchInput');

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onFocus, onBlur, onSubmit }) => {
    useStyles(s);

    const tryToSubmit = useCallback(debounce(onSubmit, 1000), [onSubmit]);

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(event.currentTarget.value);
            tryToSubmit();
        },
        [onChange, tryToSubmit],
    );

    return (
        <div className={cnSearchInput()}>
            <Icon type="search" size="xs" />
            <input
                className={cnSearchInput('Input')}
                type="text"
                placeholder="Поиск"
                value={value}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
            />
        </div>
    );
};

export default SearchInput;
