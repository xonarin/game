import React, { useCallback, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { FieldInputProps } from 'react-final-form';

import s from './CountInput.scss';
import { cn } from '../../../utils/bem-css-module';
import useNumberField from '../../../hooks/useNumberField';
import Button from '../../Button/Button';

export interface CountInputProps {
    value: number;
    error?: string;
    onChange: FieldInputProps<unknown>['onChange'];
    onFocus: FieldInputProps<unknown>['onFocus'];
    onBlur: FieldInputProps<unknown>['onBlur'];

    breakpoints: number[];
    className?: string;
}

const cnCountInput = cn(s, 'CountInput');

const CountInput: React.FC<CountInputProps> = ({ value, error, onChange, onFocus, onBlur, breakpoints, className }) => {
    useStyles(s);

    const [rawValue, handleChange, handleFocus, handleBlur] = useNumberField(value, onChange, onFocus, onBlur, 0);
    const [isCustom, setCustom] = useState(false);

    const onClickChange = useCallback(() => {
        setCustom(true);
    }, []);

    const buildOnSet = (newValue: number) => {
        return () => onChange(newValue);
    };

    return (
        <div className={cnCountInput(null, [className])}>
            {breakpoints.map(breakpoint => (
                <Button
                    className={cnCountInput('Button', { isActive: breakpoint === value })}
                    clear
                    onClick={buildOnSet(breakpoint)}
                    key={breakpoint}
                >
                    {breakpoint}
                </Button>
            ))}
            <div className={cnCountInput('ChangeContainer', { isCustom })}>
                <Button className={cnCountInput('Button')} clear onClick={onClickChange}>
                    Изменить
                </Button>
                <input
                    className={cnCountInput('Input', { isInvalid: Boolean(error) })}
                    type="text"
                    inputMode="numeric"
                    value={rawValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
            </div>
        </div>
    );
};

export default CountInput;
