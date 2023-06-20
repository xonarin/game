import React, { useCallback, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Payment.scss';
import { cn } from '../../../utils/bem-css-module';
import { PaymentMethod, WithdrawMethod } from '../../../__generated__/graphql';
import Text from '../../Text/Text';
import CornerLabel from './CornerLabel/CornerLabel';
import Icon from '../../Icon/Icon';
import { QiwiWithdrawMethod } from './QiwiWithdrawForm/QiwiWithdrawForm';

type PaymentMethodType = PaymentMethod | WithdrawMethod | QiwiWithdrawMethod;

export interface PaymentMethodsMobileProps<T extends PaymentMethodType> {
    readonly methods?: T[];
    readonly value?: T;
    readonly onChange: (value: T) => void;
}

interface PaymentMethodComponentProps<T extends PaymentMethodType> {
    // eslint-disable-next-line react/require-default-props
    readonly active?: boolean;
    // eslint-disable-next-line react/require-default-props
    readonly method?: T;
    readonly onChange: (value: T) => void;
    readonly toggle: () => void;
}

const normalPaymentMethodTypeGuardFields = [
    ['name', 'string'],
    ['avatar', 'string'],
    ['commission', 'number'],
    ['minAmount', 'number'],
    ['maxAmount', 'number'],
    ['enabled', 'boolean'],
] as const;

const normalPaymentMethodTypeGuard = (
    value: PaymentMethodType | undefined,
): value is PaymentMethod | WithdrawMethod => {
    if (!value) {
        return false;
    }

    // @ts-ignore
    // eslint-disable-next-line valid-typeof
    return normalPaymentMethodTypeGuardFields.every(([field, type]) => field in value && typeof value[field] === type);
};

const cnPayment = cn(s, 'Payment');

const PaymentMethodComponent = <T extends PaymentMethodType>({
    active = false,
    method,
    onChange,
    toggle,
}: PaymentMethodComponentProps<T>) => {
    const onClick = useCallback(() => {
        if (method) {
            onChange(method);
        }

        toggle();
    }, [method, onChange, toggle]);

    return (
        <button type="button" className={cnPayment('Method', { active })} onClick={onClick}>
            <div className={cnPayment('Method-Icon')}>
                <img src={method?.avatar} alt={method?.name} />
            </div>

            <div className={cnPayment('Method-Info')}>
                <Text color="white">{method?.name}</Text>

                <div className={cnPayment('Method-MiniInfo')}>
                    {normalPaymentMethodTypeGuard(method) && (
                        <Text color="gray" size="xs">
                            {method?.commission}% / {method?.minAmount}&nbsp;руб — {method?.maxAmount}&nbsp;руб
                        </Text>
                    )}
                </div>
            </div>
        </button>
    );
};

export const PaymentMethodsMobile = <T extends PaymentMethodType>({
    methods,
    value,
    onChange,
}: PaymentMethodsMobileProps<T>) => {
    useStyles(s);

    const [opened, setOpened] = useState(false);
    const toggle = useCallback(() => setOpened(current => !current), []);

    return (
        <div className={cnPayment('Methods', { mobile: true })}>
            <CornerLabel>Способ оплаты</CornerLabel>

            <div className={cnPayment('SelectedMethod')}>
                <PaymentMethodComponent active method={value} onChange={onChange} toggle={toggle} />
                <Icon type="left" />
            </div>

            {opened && (
                <div className={cnPayment('MethodsList')}>
                    {methods
                        ?.filter(method => method !== value)
                        .map(method => (
                            <PaymentMethodComponent
                                key={method.id}
                                method={method}
                                onChange={onChange}
                                toggle={toggle}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};
