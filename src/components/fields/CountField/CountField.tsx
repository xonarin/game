import React, { useCallback } from 'react';
import { Field } from 'react-final-form';

import CountInput, { CountInputProps } from '../../inputs/CountInput/CountInput';

export interface CountFieldProps {
    name: string;
    min?: number;
    max?: number;
    breakpoints: CountInputProps['breakpoints'];
}

const CountField: React.FC<CountFieldProps> = ({ name, min, max, breakpoints }) => {
    const onValidate = useCallback(
        (value: number) => {
            if (min && value < min) return 'MIN_VALUE';
            if (max && value > max) return 'MAX_VALUE';

            return undefined;
        },
        [max, min],
    );

    return (
        <Field name={name} validate={onValidate}>
            {({ input, meta }) => (
                <CountInput
                    value={input.value}
                    error={meta.error}
                    onChange={input.onChange}
                    onFocus={input.onFocus}
                    onBlur={input.onBlur}
                    breakpoints={breakpoints}
                />
            )}
        </Field>
    );
};

export default CountField;
