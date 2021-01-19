import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { Form, Field } from 'react-final-form';

import s from './PrizeCreatePromoCodeForm.scss';
import { cn } from '../../../utils/bem-css-module';
import { AmountInput } from '../../../components/inputs/AmountInput';
import useCreatePromoCodeMutation from '../../../hooks/graphql/bonus/useCreatePromoCodeMutation';
import { requiredValidator } from '../../../utils/validators';

interface PrizeCreatePromoCodeFormValues {
    promoCode: string;
    amount: number;
    maxUses: number;
}

const cnPrizeCreatePromoCodeForm = cn(s, 'PrizeCreatePromoCodeForm');

const PrizeCreatePromoCodeForm: React.FC = () => {
    useStyles(s);

    const createPromoCodeMutation = useCreatePromoCodeMutation();

    const onSubmit = useCallback(
        async ({ promoCode, amount, maxUses }: PrizeCreatePromoCodeFormValues) => {
            await createPromoCodeMutation(promoCode, amount, maxUses);
        },
        [createPromoCodeMutation],
    );

    return (
        <Form<PrizeCreatePromoCodeFormValues> onSubmit={onSubmit}>
            {({ handleSubmit }) => (
                <form className={cnPrizeCreatePromoCodeForm()} onSubmit={handleSubmit}>
                    <div className={cnPrizeCreatePromoCodeForm('Inputs')}>
                        <Field name="promoCode" validate={requiredValidator()}>
                            {({ input, meta: { error } }) => (
                                <input
                                    className={cnPrizeCreatePromoCodeForm('Input', { error: !!error })}
                                    placeholder="Промокод"
                                    {...input}
                                />
                            )}
                        </Field>

                        <Field name="amount" validate={requiredValidator()}>
                            {({ input, meta: { error } }) => (
                                <AmountInput
                                    className={cnPrizeCreatePromoCodeForm('Input', { error: !!error })}
                                    placeholder="Сумма промокода"
                                    maxFractionDigits={0}
                                    {...input}
                                />
                            )}
                        </Field>

                        <Field name="maxUses" validate={requiredValidator()}>
                            {({ input, meta: { error } }) => (
                                <AmountInput
                                    className={cnPrizeCreatePromoCodeForm('Input', { error: !!error })}
                                    placeholder="Количество активаций"
                                    maxFractionDigits={0}
                                    {...input}
                                />
                            )}
                        </Field>
                    </div>

                    <button type="submit">Создать</button>
                </form>
            )}
        </Form>
    );
};

export default PrizeCreatePromoCodeForm;
