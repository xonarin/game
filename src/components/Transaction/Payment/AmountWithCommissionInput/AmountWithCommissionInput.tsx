import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { FieldInputProps } from 'react-final-form';

import s from './AmountWithCommissionInput.scss';
import { cn } from '../../../../utils/bem-css-module';
import CornerLabel from '../CornerLabel/CornerLabel';
import InputWithIcon from '../../../inputs/InputWithIcon/InputWithIcon';
import { moneyRound } from '../../../../utils/money';
import useNumberField from '../../../../hooks/useNumberField';
import useLoadingState from '../../../../hooks/useLoadingState';

export interface PercentBlockProps {
    commission?: number;
    error?: string;
    value: number;
    onChange: FieldInputProps<unknown>['onChange'];
    onFocus: FieldInputProps<unknown>['onFocus'];
    onBlur: FieldInputProps<unknown>['onBlur'];
}

const toFinal = (commission: number, value: number) => `${moneyRound(value - (value * commission) / 100)}`;

const cnAmountWithCommissionInput = cn(s, 'AmountWithCommissionInput');
const AmountWithCommissionInput: React.FC<PercentBlockProps> = ({
    commission = 0,
    error,
    value,
    onChange,
    onFocus,
    onBlur,
}) => {
    useStyles(s);

    const [finalAmount, setFinalAmount] = useLoadingState(toFinal(commission, value));
    const newOnChange = useCallback(
        (newValue: number) => {
            setFinalAmount(toFinal(commission, newValue));
            onChange(newValue);
        },
        [commission, onChange, setFinalAmount],
    );

    const [rawValue, handleChange, handleFocus, handleBlur] = useNumberField(value, newOnChange, onFocus, onBlur);

    const handleFinalAmountChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            if (!Number.isNaN(+event.currentTarget.value)) {
                handleChange(String(moneyRound((100 * +event.currentTarget.value) / (100 - commission))));
            }

            setFinalAmount(event.currentTarget.value);
        },
        [commission, handleChange, setFinalAmount],
    );

    const handleFinalAmountBlur = () => setFinalAmount(toFinal(commission, value));

    return (
        <div className={cnAmountWithCommissionInput()}>
            <div className={cnAmountWithCommissionInput('Input')}>
                <CornerLabel>Сумма вывода</CornerLabel>

                <InputWithIcon error={error}>
                    <input value={rawValue} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
                </InputWithIcon>
            </div>

            <div className={cnAmountWithCommissionInput('Input')}>
                <CornerLabel>К получению</CornerLabel>

                <InputWithIcon>
                    <input
                        value={finalAmount}
                        onChange={handleFinalAmountChange}
                        onFocus={handleFocus}
                        onBlur={handleFinalAmountBlur}
                    />
                </InputWithIcon>
            </div>
        </div>
    );
};

export default AmountWithCommissionInput;
