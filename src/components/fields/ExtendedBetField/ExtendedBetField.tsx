import React from 'react';
import { Field } from 'react-final-form';

import ExtendedBetInput from '../../inputs/ExtendedBetInput/ExtendedBetInput';

export interface ExtendedBetFieldProps {
    name: string;
    className?: string;
}

const ExtendedBetField: React.FC<ExtendedBetFieldProps> = ({ name, className }) => {
    return (
        <Field name={name}>
            {({ input }) => (
                <ExtendedBetInput
                    value={input.value}
                    onChange={input.onChange}
                    onFocus={input.onFocus}
                    onBlur={input.onBlur}
                    className={className}
                />
            )}
        </Field>
    );
};

export default ExtendedBetField;
