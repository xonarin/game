import React from 'react';
import { Field } from 'react-final-form';

import BetInput, { BetInputRef } from '../../inputs/BetInput/BetInput';

export interface BetFieldProps {
    name: string;
}

const BetField = React.forwardRef<BetInputRef, BetFieldProps>(({ name }, ref) => {
    return (
        <Field<number> name={name}>
            {({ input }) => (
                <BetInput
                    value={input.value}
                    onChange={input.onChange}
                    onFocus={input.onFocus}
                    onBlur={input.onBlur}
                    ref={ref}
                />
            )}
        </Field>
    );
});

export default BetField;
