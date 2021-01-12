import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../../../../utils/bem-css-module';
import HistoryItem from './HistoryItem';
import HistoryItemWith from './HistoryItemWith';
import s from './History.scss';

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
            <div className={cnHistory('Deposits')}>
                {selectedType === 'deposits' ? <HistoryItem /> : <HistoryItemWith />}
            </div>
        </div>
    );
};

export default History;
