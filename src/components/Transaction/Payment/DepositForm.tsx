import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { Form, Field } from 'react-final-form';

import s from './Payment.scss';
import { cn } from '../../../utils/bem-css-module';
import Text from '../../Text/Text';
import InputWithIcon from '../../inputs/InputWithIcon/InputWithIcon';
import useDoDepositMutation from '../../../hooks/graphql/payments/useDoDepositMutation';
import Scrollable from '../../Scrollable/Scrollable';
import { PaymentMethods } from './PaymentMethods';
import useAvailablePaymentAndWithdrawMethodsQuery from '../../../hooks/graphql/payments/useAvailablePaymentAndWithdrawMethodsQuery';
import TextIcon from '../../TextIcon/TextIcon';
import { PaymentMethod } from '../../../__generated__/graphql';
import { composeValidators, minMaxValidator, requiredValidator } from '../../../utils/validators';
import CornerLabel from './CornerLabel/CornerLabel';
import { AmountInput } from '../../inputs/AmountInput';
import { PaymentMethodsMobile } from './PaymentMethodsMobile';

export interface DepositFormProps {
    mobile: boolean;
}

interface DepositFormValues {
    readonly method?: PaymentMethod;
    readonly amount: number;
}

const cnPayment = cn(s, 'Payment');

const fixedAmountsArray = [100, 1000, 5000, 15000, 50000];

interface AmountFieldProps {
    minAmount?: number;
    maxAmount?: number;
    mobile: boolean;
}

const AmountField: React.FC<AmountFieldProps> = ({ minAmount, maxAmount, mobile }) => (
    <Field
        name="amount"
        validate={composeValidators(requiredValidator(), minMaxValidator(minAmount, maxAmount))}
        initialValue={20}
    >
        {({ input, meta: { error } }) => (
            <>
                <InputWithIcon error={error}>
                    <AmountInput {...input} />
                </InputWithIcon>

                <div className={cnPayment('FixedAmounts')}>
                    {fixedAmountsArray.map(amount => (
                        <button
                            key={amount}
                            type="button"
                            className={cnPayment('Amount', { active: input.value === amount })}
                            onClick={() => input.onChange(amount)}
                        >
                            <TextIcon
                                text={amount}
                                color={input.value === amount ? 'white' : undefined}
                                icon="diamond"
                                iconSize={mobile ? 'xs' : 's'}
                                noGap={mobile}
                            />
                        </button>
                    ))}
                </div>
            </>
        )}
    </Field>
);

export const DepositForm: React.FC<DepositFormProps> = ({ mobile }) => {
    useStyles(s);

    const { availablePaymentMethods } = useAvailablePaymentAndWithdrawMethodsQuery();
    const doDeposit = useDoDepositMutation();

    const onSubmit: (values: DepositFormValues) => void = useCallback(
        async ({ method, amount }) => {
            const result = await doDeposit(amount, method!.id);

            if (!result?.data) {
                return;
            }

            window.location.href = result.data.doDeposit;
        },
        [doDeposit],
    );

    return (
        <Form<DepositFormValues> onSubmit={onSubmit}>
            {({ handleSubmit, values: { method } }) => (
                <form className={cnPayment()} onSubmit={handleSubmit}>
                    {!mobile && (
                        <Field<PaymentMethod>
                            name="method"
                            validate={requiredValidator()}
                            initialValue={availablePaymentMethods && availablePaymentMethods[0]}
                        >
                            {({ input }) => (
                                <PaymentMethods<PaymentMethod> methods={availablePaymentMethods} {...input} />
                            )}
                        </Field>
                    )}

                    <div className={cnPayment('Settings')}>
                        <Scrollable disablePadding>
                            <div>
                                {mobile && (
                                    <Field<PaymentMethod>
                                        name="method"
                                        validate={requiredValidator()}
                                        initialValue={availablePaymentMethods && availablePaymentMethods[0]}
                                    >
                                        {({ input }) => (
                                            <PaymentMethodsMobile<PaymentMethod>
                                                methods={availablePaymentMethods}
                                                {...input}
                                            />
                                        )}
                                    </Field>
                                )}

                                <CornerLabel>Сумма пополнения</CornerLabel>
                                <AmountField
                                    minAmount={method?.minAmount}
                                    maxAmount={method?.maxAmount}
                                    mobile={mobile}
                                />

                                <button type="submit" className={cnPayment('GoToPayment')}>
                                    Перейти к оплате
                                </button>
                            </div>

                            <div className={cnPayment('Footer')}>
                                <Text>Комиссия: </Text>

                                <Text color="white">{method?.commission}%</Text>

                                <Text> / Лимит одного пополнения: </Text>

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
