import React, { useEffect, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../../../../utils/bem-css-module';
import useAvailablePaymentAndWithdrawMethodsQuery from '../../../../../hooks/graphql/payments/useAvailablePaymentAndWithdrawMethodsQuery';
import PaymentMethods from './PaymentMethods';
import Withdraw from './Withdraw';
import Deposit from './Deposit';
import s from './Payment.scss';
import Scrollable from '../../../../Scrollable/Scrollable';

export type PaymentTypeType = 'deposit' | 'withdraw';

export interface PaymentProps {
    type: PaymentTypeType;
    openWithdrawHistory: () => void;
}

const cnPayment = cn(s, 'Payment');

const PaymentType: React.FC = ({ children }) => (
    <div className={cnPayment('Settings')}>
        <Scrollable disablePadding>{children}</Scrollable>
    </div>
);

const Payment: React.FC<PaymentProps> = ({ type, openWithdrawHistory }) => {
    useStyles(s);

    const { availablePaymentMethods, availableWithdrawMethods } = useAvailablePaymentAndWithdrawMethodsQuery();

    const [selectedDepositMethod, setSelectedDepositMethod] = useState(
        availablePaymentMethods && availablePaymentMethods[0]?.id,
    );

    const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState(
        availableWithdrawMethods && availableWithdrawMethods[0]?.id,
    );

    useEffect(() => {
        setSelectedDepositMethod(old => old || (availablePaymentMethods && availablePaymentMethods[0]?.id));
        setSelectedWithdrawMethod(old => old || (availableWithdrawMethods && availableWithdrawMethods[0]?.id));
    }, [availablePaymentMethods, availableWithdrawMethods]);

    const selectedDepositPaymentMethod = availablePaymentMethods?.find(({ id }) => id === selectedDepositMethod);
    const selectedWithdrawPaymentMethod = availableWithdrawMethods?.find(({ id }) => id === selectedWithdrawMethod);

    return (
        <div className={cnPayment()}>
            {type === 'deposit' ? (
                <>
                    <PaymentMethods
                        methods={availablePaymentMethods}
                        selectedMethod={selectedDepositMethod}
                        setSelectedMethod={setSelectedDepositMethod}
                    />

                    <PaymentType>
                        <Deposit paymentMethod={selectedDepositPaymentMethod} />
                    </PaymentType>
                </>
            ) : (
                <>
                    <PaymentMethods
                        methods={availableWithdrawMethods}
                        selectedMethod={selectedWithdrawMethod}
                        setSelectedMethod={setSelectedWithdrawMethod}
                    />

                    <PaymentType>
                        <Withdraw
                            paymentMethod={selectedWithdrawPaymentMethod}
                            openWithdrawHistory={openWithdrawHistory}
                        />
                    </PaymentType>
                </>
            )}
        </div>
    );
};

export default Payment;
