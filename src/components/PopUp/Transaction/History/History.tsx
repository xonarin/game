import React, { useState } from 'react'
import s from './History.scss';
import { cn } from '../../../../utils/bem-css-module';
import useStyles from 'isomorphic-style-loader/useStyles';
import HistoryItem from './HistoryItem';
import Text from '../../../Text/Text';


const cnHistory = cn(s, 'History');

const History = () => {
    const [selectedType, setSelectedType] = useState('withdraws')
    useStyles(s)

    return (
        <div className={cnHistory()}>
            <div className={cnHistory("Types")}>
                <button type='button' onClick={() => setSelectedType('deposits')} className={selectedType === 'deposits' ? cnHistory("Type-Active") : cnHistory("Type")}>Мои пополнения</button>
                <button type='button' onClick={() => setSelectedType('withdraws')} className={selectedType === 'withdraws' ? cnHistory("Type-Active") : cnHistory("Type")}>Мои выводы</button>
            </div>
            {selectedType === 'deposits' ?

                <div className={cnHistory('Deposits')}>
                    <HistoryItem />
                </div>
                : <div className={cnHistory('EmptyHistory')}>
                    <Text size='xl'>N/A</Text>
                    <Text size='xl'>Вы еще не делали заявок</Text>
                </div>}
            <div>

            </div>

        </div>
    )
}

export default History
