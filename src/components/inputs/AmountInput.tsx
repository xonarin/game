import React from 'react';
import { FieldInputProps } from 'react-final-form';

import useNumberField from '../../hooks/useNumberField';

export interface AmountInputProps {
    value: number;
    onChange: FieldInputProps<unknown>['onChange'];
    onFocus: FieldInputProps<unknown>['onFocus'];
    onBlur: FieldInputProps<unknown>['onBlur'];
}

export const AmountInput: React.FC<AmountInputProps> = ({ value, onChange, onFocus, onBlur }) => {
    const [rawValue, handleChange, handleFocus, handleBlur] = useNumberField(value, onChange, onFocus, onBlur, 2);

    return <input value={rawValue} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />;
};
