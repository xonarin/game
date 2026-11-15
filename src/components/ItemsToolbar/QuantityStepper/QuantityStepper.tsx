import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './QuantityStepper.scss';
import { cn } from '../../../utils/bem-css-module';

export interface QuantityStepperProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    /** Верхняя граница для этого значения (например, остаток общего лимита). */
    max: number;
    className?: string;
}

const cnStepper = cn(s, 'QuantityStepper');

/** Количество: − значение +. Значение всегда в [min, max]. */
const QuantityStepper: React.FC<QuantityStepperProps> = ({ value, onChange, min = 0, max, className }) => {
    useStyles(s);

    const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));

    return (
        <div className={cnStepper(null, [className])}>
            <button
                type="button"
                className={cnStepper('Button')}
                disabled={value <= min}
                onClick={() => set(value - 1)}
                aria-label="Меньше"
            >
                −
            </button>
            <input
                className={cnStepper('Value')}
                inputMode="numeric"
                value={value}
                aria-label="Количество"
                onChange={event => set(Number(event.target.value.replace(/\D/g, '')) || 0)}
            />
            <button
                type="button"
                className={cnStepper('Button')}
                disabled={value >= max}
                onClick={() => set(value + 1)}
                aria-label="Больше"
            >
                +
            </button>
        </div>
    );
};

export default QuantityStepper;
