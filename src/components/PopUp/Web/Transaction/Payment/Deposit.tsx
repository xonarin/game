import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../../../../utils/bem-css-module';
import Text from '../../../../Text/Text';
import Icon from '../../../../Icon/Icon';
import InputWithIcon from '../../../../InputWithIcon/InputWithIcon';
import { PaymentMethod } from '../../../../../__generated__/graphql';
import s from './Payment.scss';

interface DepositProps {
    paymentMethod?: PaymentMethod;
}

const cnPayment = cn(s, 'Payment');

const Deposit: React.FC<DepositProps> = ({ paymentMethod }) => {
    useStyles(s);

    return (
        <>
            <div>
                <InputWithIcon title=" Сумма пополнения" fixedAmounts />
                <div className={cnPayment('GoToPayment')}>Перейти к оплате</div>
            </div>

            <div className={cnPayment('Footer')}>
                <Text>
                    Комиссия: <Text color="white">{paymentMethod?.commission}%</Text> / Лимит одного пополнения:{' '}
                    <Text color="white">
                        {paymentMethod?.minAmount}
                        <Icon type="diamond" size="xs" /> − {paymentMethod?.maxAmount}
                        <Icon type="diamond" size="xs" />
                    </Text>
                </Text>
            </div>
        </>
    );
};

export default Deposit;
