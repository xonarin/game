import React from 'react';
import { FieldInputProps } from 'react-final-form';

import useNumberField from '../../hooks/useNumberField';

export interface AmountInputProps {
    className?: string;
    placeholder?: string;
    maxFractionDigits?: number;

    value: number;
    onChange: FieldInputProps<unknown>['onChange'];
    onFocus: FieldInputProps<unknown>['onFocus'];
    onBlur: FieldInputProps<unknown>['onBlur'];
}

export const AmountInput: React.FC<AmountInputProps> = ({
    className,
    placeholder,
    maxFractionDigits = 2,
    value,
    onChange,
    onFocus,
    onBlur,
}) => {
    const [rawValue, handleChange, handleFocus, handleBlur] = useNumberField(
        value,
        onChange,
        onFocus,
        onBlur,
        maxFractionDigits,
    );

    return (
        <input
            className={className}
            value={rawValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
        />
    );
};
