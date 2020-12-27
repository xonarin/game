import React, { useCallback, useEffect, useState } from 'react';
import { FieldInputProps } from 'react-final-form';

type UseNumberFieldResult = [
    string,
    (event: React.ChangeEvent<HTMLInputElement>) => void,
    (event: React.FocusEvent<HTMLInputElement>) => void,
    (event: React.FocusEvent<HTMLInputElement>) => void,
];

const reNumberInput = /^(\d+\.?\d*)?$/g;

const useNumberField = (
    value: number,
    onChange: FieldInputProps<unknown>['onChange'],
    onFocus: FieldInputProps<unknown>['onFocus'],
    onBlur: FieldInputProps<unknown>['onBlur'],
    maxFractionDigits: number = 2,
    maxLength: number = 10,
): UseNumberFieldResult => {
    const [rawValue, setRawValue] = useState<string>(value.toString());

    useEffect(() => {
        setRawValue(value.toString());
    }, [value]);

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const currentValue = event.currentTarget.value.replace(/,/g, '.');

            setRawValue(currentValue);

            if (
                currentValue.length > 0 &&
                currentValue.length <= maxLength &&
                currentValue[currentValue.length - 1] !== '.' &&
                new RegExp(reNumberInput).test(currentValue)
            ) {
                // Регуляркой гарантируется, что значение не будет NaN
                onChange(Number(Number(currentValue).toFixed(maxFractionDigits)));
            }
        },
        [maxFractionDigits, maxLength, onChange],
    );

    const restoreValue = useCallback(() => {
        setRawValue(value.toString());
    }, [setRawValue, value]);

    const handleFocus = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
            restoreValue();
            onFocus(event);
        },
        [onFocus, restoreValue],
    );

    const handleBlur = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
            restoreValue();
            onBlur(event);
        },
        [onBlur, restoreValue],
    );

    return [rawValue, handleChange, handleFocus, handleBlur];
};

export default useNumberField;
