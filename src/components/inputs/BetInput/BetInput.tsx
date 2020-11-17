import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { FieldInputProps } from 'react-final-form';

import s from './BetInput.scss';
import { cn } from '../../../utils/bem-css-module';
import Text from '../../Text/Text';
import Icon from '../../Icon/Icon';

export interface BetInputProps {
    value: number;
    onChange: FieldInputProps<unknown>['onChange'];
    onFocus: FieldInputProps<unknown>['onFocus'];
    onBlur: FieldInputProps<unknown>['onBlur'];
}

export interface BetInputRef {
    focus: (end?: boolean) => void;
    elem: () => HTMLInputElement | null;
}

const reNumberInput = /^(\d+\.?\d*)?$/g;

const cnBetInput = cn(s, 'BetInput');

const BetInput = React.forwardRef<BetInputRef, BetInputProps>(({ value, onChange, onFocus, onBlur }, ref) => {
    useStyles(s);

    const inputRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => ({
        focus: end => {
            const { current: elem } = inputRef;
            if (!elem) return;

            elem.focus();
            if (end) {
                // Костыль, чтобы переместить курсор в конец инпута
                const { value: temp } = elem;
                elem.value = '';
                elem.value = temp;
            }
        },
        elem: () => inputRef.current,
    }));

    const [rawValue, setRawValue] = useState<string>(value.toString());

    useEffect(() => {
        setRawValue(value.toString());
    }, [value]);

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const currentValue = event.currentTarget.value.replace(/,/g, '.');

            if (currentValue.length < 10 && new RegExp(reNumberInput).test(currentValue)) {
                // Регуляркой гарантируется, что transformedValue не будет NaN
                let transformedValue = Number(currentValue);

                if (currentValue.length > 0 && currentValue[currentValue.length - 1] !== '.') {
                    transformedValue = Number(transformedValue.toFixed(2));

                    setRawValue(transformedValue.toString());
                    onChange(transformedValue);
                } else {
                    setRawValue(currentValue);
                }
            }
        },
        [onChange],
    );

    return (
        <div className={cnBetInput()}>
            <Text className={cnBetInput('Pseudo')} font="Rubik" size="xl" color="white" upper>
                {rawValue}
            </Text>
            <input
                className={cnBetInput('Input')}
                type="text"
                inputMode="numeric"
                value={rawValue}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                ref={inputRef}
            />
            <Icon className={cnBetInput('Icon')} type="diamond" />
        </div>
    );
});

export default BetInput;
