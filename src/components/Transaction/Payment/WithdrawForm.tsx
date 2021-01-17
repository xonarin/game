import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { Field, Form } from 'react-final-form';

import s from './Payment.scss';
import { cn } from '../../../utils/bem-css-module';
import Text from '../../Text/Text';
import InputWithIcon from '../../inputs/InputWithIcon/InputWithIcon';
import useDoWithdrawMutation from '../../../hooks/graphql/payments/useDoWithdrawMutation';
import useAvailablePaymentAndWithdrawMethodsQuery from '../../../hooks/graphql/payments/useAvailablePaymentAndWithdrawMethodsQuery';
import PaymentMethods from './PaymentMethods';
import Scrollable from '../../Scrollable/Scrollable';
import TextIcon from '../../TextIcon/TextIcon';
import { WithdrawMethod } from '../../../__generated__/graphql';
import { composeValidators, minMaxValidator, requiredValidator } from '../../../utils/validators';
import CornerLabel from './CornerLabel/CornerLabel';
import AmountWithCommissionInput from './AmountWithCommissionInput/AmountWithCommissionInput';

export interface WithdrawFormProps {
    readonly openWithdrawHistory: () => void;
}

interface WithdrawFormValues {
    readonly method?: WithdrawMethod;
    readonly wallet: string;
    readonly amount: number;
}

const cnPayment = cn(s, 'Payment');

export const WithdrawForm: React.FC<WithdrawFormProps> = ({ openWithdrawHistory }) => {
    useStyles(s);

    const { availableWithdrawMethods } = useAvailablePaymentAndWithdrawMethodsQuery();
    const doWithdraw = useDoWithdrawMutation();

    const onSubmit: (values: WithdrawFormValues) => void = useCallback(
        async ({ method, wallet, amount }) => {
            await doWithdraw(amount, method!.id, wallet);
            openWithdrawHistory();
        },
        [doWithdraw, openWithdrawHistory],
    );

    return (
        <Form<WithdrawFormValues> onSubmit={onSubmit}>
            {({ handleSubmit, values: { method } }) => (
                <form className={cnPayment()} onSubmit={handleSubmit}>
                    <Field
                        name="method"
                        validate={requiredValidator()}
                        initialValue={availableWithdrawMethods && availableWithdrawMethods[0]}
                    >
                        {({ input }) => (
                            <PaymentMethods<WithdrawMethod>
                                methods={availableWithdrawMethods}
                                value={input.value}
                                onChange={input.onChange}
                            />
                        )}
                    </Field>

                    <div className={cnPayment('Settings')}>
                        <Scrollable disablePadding>
                            <div>
                                <CornerLabel>Номер кошелька</CornerLabel>

                                <Field name="wallet" validate={requiredValidator()}>
                                    {({ input, meta: { error } }) => (
                                        <InputWithIcon icon={method?.avatar} error={error}>
                                            <input placeholder="Введите номер кошелька" {...input} />
                                        </InputWithIcon>
                                    )}
                                </Field>

                                <Field
                                    name="amount"
                                    validate={composeValidators(
                                        requiredValidator(),
                                        minMaxValidator(method?.minAmount, method?.maxAmount),
                                    )}
                                >
                                    {({ input, meta: { error } }) => (
                                        <AmountWithCommissionInput
                                            commission={method?.commission}
                                            error={error}
                                            value={input.value}
                                            onChange={input.onChange}
                                            onFocus={input.onFocus}
                                            onBlur={input.onBlur}
                                        />
                                    )}
                                </Field>

                                <button type="submit" className={cnPayment('GoToPayment')}>
                                    Заказать вывод
                                </button>
                            </div>

                            <div className={cnPayment('Footer')}>
                                <Text>Комиссия: </Text>

                                <Text color="white">{method?.commission}%</Text>

                                <Text> / Лимит одного вывода: </Text>

                                <TextIcon text={method?.minAmount} color="white" icon="diamond" iconSize="xs" noGap />

                                <Text> — </Text>

                                <TextIcon text={method?.maxAmount} color="white" icon="diamond" iconSize="xs" noGap />
                            </div>
                        </Scrollable>
                    </div>
                </form>
            )}
        </Form>
    );
};
