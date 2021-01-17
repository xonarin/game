import React, { useCallback, useEffect, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../../utils/bem-css-module';
import Text from '../../Text/Text';
import InputWithIcon from '../../InputWithIcon/InputWithIcon';
import PercentBlock from '../../PercentBlock/PercentBlock';
import useDoWithdrawMutation from '../../../hooks/graphql/payments/useDoWithdrawMutation';
import useAvailablePaymentAndWithdrawMethodsQuery from '../../../hooks/graphql/payments/useAvailablePaymentAndWithdrawMethodsQuery';
import PaymentMethods from './PaymentMethods_';
import Scrollable from '../../Scrollable/Scrollable';
import TextIcon from '../../TextIcon/TextIcon';
import s from './Payment.scss';

interface WithdrawProps {
    openWithdrawHistory: () => void;
}

const cnPayment = cn(s, 'Payment');

const Withdraw: React.FC<WithdrawProps> = ({ openWithdrawHistory }) => {
    useStyles(s);

    const { availableWithdrawMethods } = useAvailablePaymentAndWithdrawMethodsQuery();
    const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState(
        availableWithdrawMethods && availableWithdrawMethods[0]?.id,
    );

    useEffect(() => {
        setSelectedWithdrawMethod(old => old || (availableWithdrawMethods && availableWithdrawMethods[0]?.id));
    }, [availableWithdrawMethods]);

    const selectedWithdrawPaymentMethod = availableWithdrawMethods?.find(({ id }) => id === selectedWithdrawMethod);

    const [wallet, setWallet] = useState('');
    const [amount, setAmount] = useState<number | null>(null);

    const doWithdraw = useDoWithdrawMutation();

    const onClick = useCallback(async () => {
        if (amount === null || !selectedWithdrawPaymentMethod) {
            return;
        }

        await doWithdraw(amount, selectedWithdrawPaymentMethod.id, wallet);
        openWithdrawHistory();
    }, [amount, doWithdraw, openWithdrawHistory, selectedWithdrawPaymentMethod, wallet]);

    return (
        <div className={cnPayment()}>
            <PaymentMethods
                methods={availableWithdrawMethods}
                value={selectedWithdrawMethod}
                onChange={setSelectedWithdrawMethod}
            />

            <Scrollable disablePadding>
                <div className={cnPayment('Settings')}>
                    <div>
                        <InputWithIcon
                            title=" Номер кошелька"
                            icon={selectedWithdrawPaymentMethod?.avatar}
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
                            Комиссия: <Text color="white">{selectedWithdrawPaymentMethod?.commission}%</Text> / Лимит
                            одного вывода:{' '}
                            <TextIcon
                                text={selectedWithdrawPaymentMethod?.minAmount}
                                color="white"
                                icon="diamond"
                                iconSize="xs"
                                noGap
                            />{' '}
                            −{' '}
                            <TextIcon
                                text={selectedWithdrawPaymentMethod?.maxAmount}
                                color="white"
                                icon="diamond"
                                iconSize="xs"
                                noGap
                            />
                        </Text>
                    </div>
                </div>
            </Scrollable>
        </div>
    );
};

export default Withdraw;
