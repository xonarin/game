import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './History.scss';
import { cn } from '../../../utils/bem-css-module';
import HistoryItem from './HistoryItem';
import HistoryItemWith from './HistoryItemWith';
import Text from '../../../components/Text/Text';

const cnHistory = cn(s, 'History');

const History = () => {
    const [selectedType, setSelectedType] = useState('withdraws');
    useStyles(s);

    return (
        <div className={cnHistory()}>
            <div className={cnHistory('Types')}>
                <button
                    type="button"
                    onClick={() => setSelectedType('deposits')}
                    className={selectedType === 'deposits' ? cnHistory('Type-Active') : cnHistory('Type')}
                >
                    Мои пополнения
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedType('withdraws')}
                    className={selectedType === 'withdraws' ? cnHistory('Type-Active') : cnHistory('Type')}
                >
                    Мои выводы
                </button>
            </div>
            {selectedType === 'deposits' ? (
                <div className={cnHistory('Deposits')}>
                    <HistoryItem />
                </div>
            ) : (
                <div className={cnHistory('Deposits')}>
                    <HistoryItemWith />
                </div>
            )}
            <div />
        </div>
    );
};

export default History;
