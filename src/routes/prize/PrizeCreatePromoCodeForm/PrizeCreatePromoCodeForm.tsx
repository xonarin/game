import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { Form, Field } from 'react-final-form';

import s from './PrizeCreatePromoCodeForm.scss';
import { cn } from '../../../utils/bem-css-module';
import { AmountInput } from '../../../components/inputs/AmountInput';

const cnPrizeCreatePromoCodeForm = cn(s, 'PrizeCreatePromoCodeForm');

const PrizeCreatePromoCodeForm: React.FC = () => {
    useStyles(s);

    const onSubmit = useCallback(() => {
        // TODO
    }, []);

    return (
        <Form onSubmit={onSubmit}>
            {({ handleSubmit }) => (
                <form className={cnPrizeCreatePromoCodeForm()} onSubmit={handleSubmit}>
                    <div className={cnPrizeCreatePromoCodeForm('Inputs')}>
                        <Field name="amount">
                            {({ input }) => <AmountInput placeholder="Сумма промокода" {...input} />}
                        </Field>

                        <Field name="maxActivations">
                            {({ input }) => (
                                <AmountInput placeholder="Количество активаций" maxFractionDigits={0} {...input} />
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
