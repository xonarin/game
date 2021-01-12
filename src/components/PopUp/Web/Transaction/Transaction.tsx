import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import Icon from '../../../Icon/Icon';
import Text from '../../../Text/Text';
import { cn } from '../../../../utils/bem-css-module';
import History from './History/History';
import Payment from './Payment/Payment';
import s from './Transaction.scss';

export interface TransactionProps {
    close: () => void;
}

type SelectedTypeType = 'deposit' | 'withdraw' | 'history';

const cnTransaction = cn(s, 'Transaction');

const types: [SelectedTypeType, React.ReactNode][] = [
    ['deposit', 'Пополнение'],
    ['withdraw', 'Вывод'],
    ['history', 'История'],
];

const Transaction: React.FC<TransactionProps> = ({ close }) => {
    const [selectedType, setSelectedType] = useState<SelectedTypeType>('deposit');
    useStyles(s);

    return (
        <div className={cnTransaction()}>
            <div className={cnTransaction('Header')}>
                <div className={cnTransaction('Types')}>
                    {types.map(([type, label]) => (
                        <button
                            key={type}
                            type="button"
                            className={cnTransaction('Type', { active: selectedType === type })}
                            onClick={() => setSelectedType(type)}
                        >
                            <Icon type="add" />
                            <Text>{label}</Text>
                        </button>
                    ))}
                </div>

                <button type="button" onClick={close} className={cnTransaction('Close')}>
                    <Icon type="close" />
                </button>
            </div>

            {selectedType !== 'history' ? <Payment type={selectedType} /> : <History />}
        </div>
    );
};

export default Transaction;
