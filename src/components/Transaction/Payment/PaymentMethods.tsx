import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Payment.scss';
import { cn } from '../../../utils/bem-css-module';
import { PaymentMethod, WithdrawMethod } from '../../../__generated__/graphql';
import Text from '../../Text/Text';
import Scrollable from '../../Scrollable/Scrollable';
import CornerLabel from './CornerLabel/CornerLabel';

type PaymentMethodType = PaymentMethod | WithdrawMethod;

export interface PaymentMethodsProps<T extends PaymentMethodType> {
    readonly methods?: T[];
    readonly value?: T;
    readonly onChange: (value: T) => void;
}

const cnPayment = cn(s, 'Payment');

export const PaymentMethods = <T extends PaymentMethodType>({ methods, value, onChange }: PaymentMethodsProps<T>) => {
    useStyles(s);

    return (
        <div className={cnPayment('Methods')}>
            <CornerLabel className={cnPayment('MethodsTitle')}>Способ оплаты</CornerLabel>

            <Scrollable disablePadding>
                {methods?.map(method => (
                    <button
                        key={method.id}
                        type="button"
                        className={cnPayment('Method', { active: value?.id === method.id })}
                        onClick={() => onChange(method)}
                    >
                        <div className={cnPayment('Method-Icon')}>
                            <img src={method.avatar} alt={method.name} />
                        </div>

                        <div className={cnPayment('Method-Info')}>
                            <Text color="white">{method.name}</Text>
                            <div className={cnPayment('Method-MiniInfo')}>
                                <Text color="gray" size="xs">
                                    {method.commission}% / {method.minAmount}&nbsp;руб — {method.maxAmount}&nbsp;руб
                                </Text>
                            </div>
                        </div>
                    </button>
                ))}
            </Scrollable>
        </div>
    );
};
