import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './History.scss';
import { cn } from '../../../utils/bem-css-module';
import DepositHistoryItem from './DepositHistoryItem';
import WithdrawHistoryItem from './WithdrawHistoryItem';
import usePaymentsAndWithdrawsQuery from '../../../hooks/graphql/payments/usePaymentsAndWithdrawsQuery';
import Scrollable from '../../Scrollable/Scrollable';

export interface HistoryRef {
    openWithdrawHistory: () => void;
}

type SelectedTypeType = 'deposits' | 'withdraws';

const cnHistory = cn(s, 'History');

const History = forwardRef<HistoryRef>((_0, ref) => {
    const [selectedType, setSelectedType] = useState<SelectedTypeType>('deposits');
    useStyles(s);

    useImperativeHandle(ref, () => ({
        openWithdrawHistory: () => {
            setSelectedType('withdraws');
        },
    }));

    const { payments, withdraws } = usePaymentsAndWithdrawsQuery();

    const paymentsRender = useMemo(
        () => payments?.map(payment => <DepositHistoryItem key={payment.id} payment={payment} />),
        [payments],
    );

    const withdrawsRender = useMemo(
        () => withdraws?.map(withdraw => <WithdrawHistoryItem key={withdraw.id} withdraw={withdraw} />),
        [withdraws],
    );

    return (
        <div className={cnHistory()}>
            <div className={cnHistory('Types')}>
                <button
                    type="button"
                    onClick={() => setSelectedType('deposits')}
                    className={cnHistory('Type', { active: selectedType === 'deposits' })}
                >
                    Мои пополнения
                </button>

                <button
                    type="button"
                    onClick={() => setSelectedType('withdraws')}
                    className={cnHistory('Type', { active: selectedType === 'withdraws' })}
                >
                    Мои выводы
                </button>
            </div>

            <Scrollable disablePadding>
                <div className={cnHistory('Deposits')}>
                    {selectedType === 'deposits' && paymentsRender}
                    {selectedType === 'withdraws' && withdrawsRender}
                </div>
            </Scrollable>
        </div>
    );
});

export default History;
