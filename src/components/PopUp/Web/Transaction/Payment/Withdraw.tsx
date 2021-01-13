import React, { useCallback, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../../../../utils/bem-css-module';
import Text from '../../../../Text/Text';
import Icon from '../../../../Icon/Icon';
import InputWithIcon from '../../../../InputWithIcon/InputWithIcon';
import PercentBlock from '../../../../PercentBlock/PercentBlock';
import { PaymentMethod } from '../../../../../__generated__/graphql';
import s from './Payment.scss';
import useDoWithdrawMutation from '../../../../../hooks/graphql/payments/useDoWithdrawMutation';

interface WithdrawProps {
    paymentMethod?: PaymentMethod;
    openWithdrawHistory: () => void;
}

const cnPayment = cn(s, 'Payment');

const Withdraw: React.FC<WithdrawProps> = ({ paymentMethod, openWithdrawHistory }) => {
    useStyles(s);

    const [wallet, setWallet] = useState('');
    const [amount, setAmount] = useState<number | null>(null);

    const doWithdraw = useDoWithdrawMutation();

    const onClick = useCallback(async () => {
        if (amount === null || !paymentMethod) {
            return;
        }

        await doWithdraw(amount, paymentMethod.id, wallet);
        openWithdrawHistory();
    }, [amount, doWithdraw, openWithdrawHistory, paymentMethod, wallet]);

    return (
        <>
            <div>
                <InputWithIcon
                    title=" Номер кошелька"
                    icon={paymentMethod?.avatar}
                    value={wallet}
                    onChange={setWallet}
                />

                <PercentBlock value={amount} onChange={setAmount} />

                <button type="button" className={cnPayment('GoToPayment')} onClick={onClick}>
                    Заказать вывод
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

export default Withdraw;
