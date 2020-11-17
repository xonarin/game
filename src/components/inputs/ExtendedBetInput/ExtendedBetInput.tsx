import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { FieldInputProps } from 'react-final-form';

import s from './ExtendedBetInput.scss';
import { cn } from '../../../utils/bem-css-module';
import Button from '../../Button/Button';
import useNumberField from '../../../hooks/useNumberField';

export interface ExtendedBetInputProps {
    value: number;
    onChange: FieldInputProps<unknown>['onChange'];
    onFocus: FieldInputProps<unknown>['onFocus'];
    onBlur: FieldInputProps<unknown>['onBlur'];

    addBreakpoints?: number[];
    className?: string;
}

const cnExtendedBetInput = cn(s, 'ExtendedBetInput');

const ExtendedBetInput: React.FC<ExtendedBetInputProps> = ({
    value,
    onChange,
    onFocus,
    onBlur,
    addBreakpoints = [10, 25, 50, 100, 250, 500],
    className,
}) => {
    useStyles(s);

    const [rawValue, handleChange, handleFocus, handleBlur] = useNumberField(value, onChange, onFocus, onBlur);

    const onClear = useCallback(() => {
        onChange(0);
    }, [onChange]);

    const buildOnMultiply = (multiplier: number) => {
        return () => onChange(Number((value * multiplier).toFixed(2)));
    };

    const buildOnAdd = (inc: number) => {
        return () => onChange(Number((value + inc).toFixed(2)));
    };

    return (
        <div className={cnExtendedBetInput(null, [className])}>
            <div className={cnExtendedBetInput('InputContainer')}>
                <input
                    className={cnExtendedBetInput('Input')}
                    type="text"
                    inputMode="numeric"
                    value={rawValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                <div className={cnExtendedBetInput('InputControls')}>
                    <Button
                        className={cnExtendedBetInput('ClearButton', { isShow: rawValue.length > 1 })}
                        clear
                        onClick={onClear}
                    >
                        ×
                    </Button>
                    <Button className={cnExtendedBetInput('MultiplyButton')} clear onClick={buildOnMultiply(0.5)}>
                        :2
                    </Button>
                    <Button className={cnExtendedBetInput('MultiplyButton')} clear onClick={buildOnMultiply(2)}>
                        ×2
                    </Button>
                </div>
            </div>
            <div className={cnExtendedBetInput('AddButtons')}>
                {addBreakpoints.map(breakpoint => (
                    <Button
                        className={cnExtendedBetInput('AddButton')}
                        clear
                        onClick={buildOnAdd(breakpoint)}
                        key={breakpoint}
                    >
                        +{breakpoint}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default ExtendedBetInput;
