import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../../../../utils/bem-css-module';
import { PaymentMethod, WithdrawMethod } from '../../../../../__generated__/graphql';
import Icon from '../../../../Icon/Icon';
import Text from '../../../../Text/Text';
import s from './Payment.scss';
import Scrollable from '../../../../Scrollable/Scrollable';

type PaymentMethodType = PaymentMethod | WithdrawMethod;

export interface PaymentMethodsProps {
    readonly methods?: PaymentMethodType[];
    readonly selectedMethod?: string;
    readonly setSelectedMethod: (value: string) => void;
}

const cnPayment = cn(s, 'Payment');

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ methods, selectedMethod, setSelectedMethod }) => {
    useStyles(s);

    return (
        <div className={cnPayment('Methods')}>
            <div className={cnPayment('Method')}>
                <div className={cnPayment('Category-Icon')}>
                    <Icon type="rightWhite" />
                </div>

                <Text>Способ оплаты</Text>
            </div>

            <Scrollable disablePadding>
                {methods?.map(method => (
                    <button
                        key={method.id}
                        type="button"
                        className={cnPayment('Method', { active: selectedMethod === method.id })}
                        onClick={() => setSelectedMethod(method.id)}
                    >
                        <div className={cnPayment('Method-Icon')}>
                            <img src={method.avatar} alt={method.name} />
                        </div>

                        <div className={cnPayment('Method-Info')}>
                            <Text color="white">{method.name}</Text>
                            <div className={cnPayment('Method-MiniInfo')}>
                                <Text color="gray" size="xs">
                                    Депозит от {method.minAmount} руб
                                </Text>
                            </div>
                        </div>
                    </button>
                ))}
            </Scrollable>
        </div>
    );
};

export default PaymentMethods;
