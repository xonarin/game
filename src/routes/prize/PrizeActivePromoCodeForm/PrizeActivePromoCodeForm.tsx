import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { Form, Field } from 'react-final-form';

import s from './PrizeActivePromoCodeForm.scss';
import { cn } from '../../../utils/bem-css-module';

const cnPrizeActivePromoCodeForm = cn(s, 'PrizeActivePromoCodeForm');

const PrizeActivePromoCodeForm: React.FC = () => {
    useStyles(s);

    const onSubmit = useCallback(() => {
        // TODO
    }, []);

    return (
        <Form onSubmit={onSubmit}>
            {({ handleSubmit }) => (
                <form className={cnPrizeActivePromoCodeForm()} onSubmit={handleSubmit}>
                    <Field name="promoCode">{({ input }) => <input placeholder="Введите промокод" {...input} />}</Field>

                    <button type="submit">Активировать</button>
                </form>
            )}
        </Form>
    );
};

export default PrizeActivePromoCodeForm;
