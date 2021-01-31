import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { Field, Form } from 'react-final-form';
import { FormApi } from 'final-form';

import s from '../Payment.scss';
import cardAvatar from './providerIcons/card.svg';
import yooAvatar from './providerIcons/yoo.svg';
import wmAvatar from './providerIcons/wm.png';
import qiwiAvatar from './providerIcons/qiwi.svg';
import { cn } from '../../../../utils/bem-css-module';
import Scrollable from '../../../Scrollable/Scrollable';
import QiwiWithdrawStats from './QiwiWithdrawStats';
import { PaymentMethodsMobile } from '../PaymentMethodsMobile';
import CornerLabel from '../CornerLabel/CornerLabel';
import { composeValidators, minMaxValidator, requiredValidator } from '../../../../utils/validators';
import InputWithIcon from '../../../inputs/InputWithIcon/InputWithIcon';
import { QiwiWithdrawMethod as QiwiWithdrawMethodId, QiwiWithdrawPurse } from '../../../../__generated__/graphql';
import { AmountInput } from '../../../inputs/AmountInput';
import useQiwiWithdrawStatsQuery from '../../../../hooks/graphql/payments/useQiwiWithdrawStatsQuery';
import useDoQiwiWithdrawMutation from '../../../../hooks/graphql/payments/useDoQiwiWithdrawMutation';
import Text from '../../../Text/Text';

export interface QiwiWithdrawMethod {
    id: QiwiWithdrawMethodId;
    name: string;
    avatar: string;
}

interface QiwiWithdrawFormValues {
    method: QiwiWithdrawMethod;
    amount: number;
    wallet: string;

    remName?: string;
    remNameF?: string;
    recAddress?: string;
    recCity?: string;
    recCountry?: string;
    regName?: string;
    regNameF?: string;
}

const qiwiWithdrawMethods: QiwiWithdrawMethod[] = [
    { id: QiwiWithdrawMethodId.Visa, name: 'Visa (кроме РФ)', avatar: cardAvatar },
    { id: QiwiWithdrawMethodId.YooMoney, name: 'ЮMoney', avatar: yooAvatar },
    { id: QiwiWithdrawMethodId.Wmz, name: 'WebMoney WMZ', avatar: wmAvatar },
    { id: QiwiWithdrawMethodId.Qiwi, name: 'Qiwi', avatar: qiwiAvatar },
];

const cardFields: [keyof QiwiWithdrawPurse, string][] = [
    ['remName', 'Имя отправителя'],
    ['remNameF', 'Фамилия отправителя'],
    ['recAddress', 'Адрес отправителя (без почтового индекса, в произвольной форме)'],
    ['recCity', 'Город отправителя'],
    ['recCountry', 'Страна отправителя'],
    ['regName', 'Имя получателя'],
    ['regNameF', 'Фамилия получателя'],
];

const cnPayment = cn(s, 'Payment');

const QiwiWithdrawForm: React.FC = () => {
    useStyles(s);

    const { qiwiWithdrawStats } = useQiwiWithdrawStatsQuery();
    const maxAmounts = [qiwiWithdrawStats?.turnover?.rest ?? undefined, qiwiWithdrawStats?.balance ?? undefined].filter(
        a => a !== undefined,
    ) as number[];

    const maxAmount = maxAmounts.length ? Math.min(...maxAmounts) : undefined;

    const doQiwiWithdraw = useDoQiwiWithdrawMutation();
    const onSubmit = useCallback(
        async (
            { method, amount, wallet, ...params }: QiwiWithdrawFormValues,
            form: FormApi<QiwiWithdrawFormValues>,
        ) => {
            await doQiwiWithdraw(amount, method.id, { account: wallet, ...params });
            setTimeout(() => form.reset());
        },
        [doQiwiWithdraw],
    );

    return (
        <Form<QiwiWithdrawFormValues> onSubmit={onSubmit} initialValues={{ method: qiwiWithdrawMethods[0] }}>
            {({ handleSubmit, values: { method } }) => (
                <form className={cnPayment()} onSubmit={handleSubmit}>
                    <div className={cnPayment('Settings')}>
                        <Scrollable disablePadding>
                            <div>
                                <QiwiWithdrawStats />

                                <CornerLabel>Сумма вывода</CornerLabel>
                                <Field
                                    name="amount"
                                    validate={composeValidators(requiredValidator(), minMaxValidator(0, maxAmount))}
                                    initialValue={maxAmount}
                                >
                                    {({ input, meta: { error } }) => (
                                        <InputWithIcon error={error}>
                                            <AmountInput placeholder="Введите сумму вывода" {...input} />
                                        </InputWithIcon>
                                    )}
                                </Field>

                                <Field name="method">
                                    {({ input }) => (
                                        <PaymentMethodsMobile<QiwiWithdrawMethod>
                                            methods={qiwiWithdrawMethods}
                                            {...input}
                                        />
                                    )}
                                </Field>

                                <CornerLabel>Номер счёта</CornerLabel>
                                <Field name="wallet" validate={requiredValidator()}>
                                    {({ input, meta: { error } }) => (
                                        <InputWithIcon icon={method.avatar} error={error}>
                                            <input placeholder="Введите номер счёта" {...input} />
                                        </InputWithIcon>
                                    )}
                                </Field>

                                {method.id === QiwiWithdrawMethodId.Visa && (
                                    <>
                                        <hr />
                                        <Text>Дополнительная информация для вывода на карту:</Text>
                                        {cardFields.map(([name, label]) => (
                                            <React.Fragment key={name}>
                                                <CornerLabel>{label}</CornerLabel>

                                                <Field name={name} validate={requiredValidator()}>
                                                    {({ input, meta: { error } }) => (
                                                        <InputWithIcon error={error}>
                                                            <input placeholder={label} {...input} />
                                                        </InputWithIcon>
                                                    )}
                                                </Field>
                                            </React.Fragment>
                                        ))}
                                    </>
                                )}

                                <button type="submit" className={cnPayment('GoToPayment')}>
                                    Перейти к оплате
                                </button>
                            </div>
                        </Scrollable>
                    </div>
                </form>
            )}
        </Form>
    );
};

export default QiwiWithdrawForm;
