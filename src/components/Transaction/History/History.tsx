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

export interface HistoryProps {
    mobile: boolean;
}

type SelectedTypeType = 'deposits' | 'withdraws';

const cnHistory = cn(s, 'History');

export const History = forwardRef<HistoryRef, HistoryProps>(({ mobile }, ref) => {
    const [selectedType, setSelectedType] = useState<SelectedTypeType>('deposits');
    useStyles(s);

    const { payments, withdraws, refetch } = usePaymentsAndWithdrawsQuery();

    useImperativeHandle(ref, () => ({
        openWithdrawHistory: async () => {
            await refetch();
            setSelectedType('withdraws');
        },
    }));

    const paymentsRender = useMemo(
        () => payments?.map(payment => <DepositHistoryItem key={payment.id} payment={payment} />),
        [payments],
    );

    const withdrawsRender = useMemo(
        () => withdraws?.map(withdraw => <WithdrawHistoryItem key={withdraw.id} withdraw={withdraw} mobile={mobile} />),
        [mobile, withdraws],
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
