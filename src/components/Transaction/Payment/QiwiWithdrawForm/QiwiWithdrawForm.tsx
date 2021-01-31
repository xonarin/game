import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { Form, Field } from 'react-final-form';

import s from '../Payment.scss';
import cardAvatar from './providerIcons/card.svg';
import yooAvatar from './providerIcons/yoo.svg';
import wmAvatar from './providerIcons/wm.png';
import { cn } from '../../../../utils/bem-css-module';
import Scrollable from '../../../Scrollable/Scrollable';
import QiwiWithdrawStats from './QiwiWithdrawStats';
import { PaymentMethodsMobile } from '../PaymentMethodsMobile';
import CornerLabel from '../CornerLabel/CornerLabel';
import { requiredValidator } from '../../../../utils/validators';
import InputWithIcon from '../../../inputs/InputWithIcon/InputWithIcon';

export interface QiwiWithdrawMethod {
    id: 'Card' | 'Yoo' | 'WMZ';
    name: string;
    avatar: string;
}

interface QiwiWithdrawFormValues {
    method: QiwiWithdrawMethod;
}

const qiwiWithdrawMethods: QiwiWithdrawMethod[] = [
    { id: 'Card', name: 'Карта', avatar: cardAvatar },
    { id: 'Yoo', name: 'Ю-Money', avatar: yooAvatar },
    { id: 'WMZ', name: 'Webmoney WMZ', avatar: wmAvatar },
];

const cnPayment = cn(s, 'Payment');

const QiwiWithdrawForm: React.FC = () => {
    useStyles(s);

    const onSubmit = useCallback(() => {}, []);

    return (
        <Form<QiwiWithdrawFormValues> onSubmit={onSubmit}>
            {({ handleSubmit, values: { method } }) => (
                <form className={cnPayment()} onSubmit={handleSubmit}>
                    <div className={cnPayment('Settings')}>
                        <Scrollable disablePadding>
                            <div>
                                <QiwiWithdrawStats />

                                <Field name="method" initialValue={qiwiWithdrawMethods[0]}>
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
                                        <InputWithIcon icon={method?.avatar} error={error}>
                                            <input placeholder="Введите номер счёта" {...input} />
                                        </InputWithIcon>
                                    )}
                                </Field>
                            </div>
                        </Scrollable>
                    </div>
                </form>
            )}
        </Form>
    );
};

export default QiwiWithdrawForm;
