import React, { useCallback, useRef, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Transaction.scss';
import Icon, { IconProps } from '../Icon/Icon';
import Text from '../Text/Text';
import { cn } from '../../utils/bem-css-module';
import { History, HistoryRef } from './History/History';
import { DepositForm } from './Payment/DepositForm';
import { WithdrawForm } from './Payment/WithdrawForm';

export interface TransactionProps {
    mobile?: boolean;
    close?: () => void;
}

type SelectedTypeType = 'deposit' | 'withdraw' | 'history';

const cnTransaction = cn(s, 'Transaction');

const types: [SelectedTypeType, IconProps['type'], React.ReactNode][] = [
    ['deposit', 'add', 'Пополнение'],
    ['withdraw', 'minus', 'Вывод'],
    ['history', 'clock', 'История'],
];

export const Transaction: React.FC<TransactionProps> = ({ mobile = false, close }) => {
    const [selectedType, setSelectedType] = useState<SelectedTypeType>('deposit');
    useStyles(s);

    const historyRef = useRef<HistoryRef | null>(null);

    const openWithdrawHistory = useCallback(() => {
        setSelectedType('history');

        const o = () => {
            if (historyRef.current) {
                historyRef.current.openWithdrawHistory();
            } else {
                setTimeout(o, 10);
            }
        };

        o();
    }, []);

    return (
        <div className={cnTransaction({ mobile })}>
            <div className={cnTransaction('Header')}>
                <div className={cnTransaction('Types')}>
                    {types.map(([type, icon, label]) => (
                        <button
                            key={type}
                            type="button"
                            className={cnTransaction('Type', { active: selectedType === type })}
                            onClick={() => setSelectedType(type)}
                        >
                            <Icon type={icon} />
                            <Text>{label}</Text>
                        </button>
                    ))}
                </div>

                <button type="button" onClick={close} className={cnTransaction('Close')}>
                    <Icon type="close" />
                </button>
            </div>

            {selectedType === 'deposit' && <DepositForm mobile={mobile} />}
            {selectedType === 'withdraw' && <WithdrawForm mobile={mobile} openWithdrawHistory={openWithdrawHistory} />}
            {selectedType === 'history' && <History mobile={mobile} ref={historyRef} />}
        </div>
    );
};
