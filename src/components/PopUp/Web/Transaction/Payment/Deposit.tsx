import React, { useCallback, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../../../../utils/bem-css-module';
import Text from '../../../../Text/Text';
import Icon from '../../../../Icon/Icon';
import InputWithIcon from '../../../../InputWithIcon/InputWithIcon';
import { PaymentMethod } from '../../../../../__generated__/graphql';
import s from './Payment.scss';
import useDoDepositMutation from '../../../../../hooks/graphql/payments/useDoDepositMutation';

interface DepositProps {
    paymentMethod?: PaymentMethod;
}

const cnPayment = cn(s, 'Payment');

const Deposit: React.FC<DepositProps> = ({ paymentMethod }) => {
    useStyles(s);

    const [amount, setAmount] = useState('500');
    const doDeposit = useDoDepositMutation();

    const onClick = useCallback(async () => {
        if (!paymentMethod || Number.isNaN(+amount)) {
            return;
        }

        const { data } = await doDeposit(+amount, paymentMethod.id);
        if (!data) {
            return;
        }

        window.location.href = data.doDeposit;
    }, [amount, doDeposit, paymentMethod]);

    return (
        <>
            <div>
                <InputWithIcon title=" Сумма пополнения" fixedAmounts value={amount} onChange={setAmount} />

                <button type="button" className={cnPayment('GoToPayment')} onClick={onClick}>
                    Перейти к оплате
                </button>
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
