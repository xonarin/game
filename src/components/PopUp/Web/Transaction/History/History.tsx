import React, { useMemo, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../../../../utils/bem-css-module';
import DepositHistoryItem from './DepositHistoryItem';
import WithdrawHistoryItem from './WithdrawHistoryItem';
import usePaymentsAndWithdrawsQuery from '../../../../../hooks/graphql/payments/usePaymentsAndWithdrawsQuery';
import s from './History.scss';

type SelectedTypeType = 'deposits' | 'withdraws';

const cnHistory = cn(s, 'History');

const History = () => {
    const [selectedType, setSelectedType] = useState<SelectedTypeType>('deposits');
    useStyles(s);

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

            <div className={cnHistory('Deposits')}>
                {selectedType === 'deposits' && paymentsRender}
                {selectedType === 'withdraws' && withdrawsRender}
            </div>
        </div>
    );
};

export default History;
