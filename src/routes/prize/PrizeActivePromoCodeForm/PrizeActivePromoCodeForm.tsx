import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { Form, Field } from 'react-final-form';

import s from './PrizeActivePromoCodeForm.scss';
import { cn } from '../../../utils/bem-css-module';
import useUsePromoCodeMutation from '../../../hooks/graphql/bonus/useUsePromoCodeMutation';
import { requiredValidator } from '../../../utils/validators';

const cnPrizeActivePromoCodeForm = cn(s, 'PrizeActivePromoCodeForm');

const PrizeActivePromoCodeForm: React.FC = () => {
    useStyles(s);

    const usePromoCodeMutation = useUsePromoCodeMutation();
    const onSubmit = useCallback(
        async ({ promoCode }) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            await usePromoCodeMutation(promoCode);
        },
        [usePromoCodeMutation],
    );

    return (
        <Form onSubmit={onSubmit}>
            {({ handleSubmit }) => (
                <form className={cnPrizeActivePromoCodeForm()} onSubmit={handleSubmit}>
                    <Field name="promoCode" validate={requiredValidator()}>
                        {({ input, meta: { error } }) => (
                            <input
                                className={cnPrizeActivePromoCodeForm('Input', { error: !!error })}
                                placeholder="Введите промокод"
                                {...input}
                            />
                        )}
                    </Field>

                    <button type="submit">Активировать</button>
                </form>
            )}
        </Form>
    );
};

export default PrizeActivePromoCodeForm;
