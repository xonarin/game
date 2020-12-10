import React, { useState } from 'react';
import Icon from '../../Icon/Icon';
import Text from '../../Text/Text';
import s from './Transaction.scss';
import { cn } from '../../../utils/bem-css-module';
import useStyles from 'isomorphic-style-loader/useStyles';
import Deposit from './Deposit/Deposit';
import Withdraw from './Withdraw/Withdraw';
import History from './History/History';

export interface TransactionProps {
    close: Function
}
const cnDeposit = cn(s, 'Deposit');

const Transaction: React.FC<TransactionProps> = ({ close }) => {
    const [selectedType, setSelectedType] = useState("deposit")
    useStyles(s)
    return (
        <div className={cnDeposit()}>
            <div className={cnDeposit('Header')}>
                <div className={cnDeposit('Types')}>
                    <button className={selectedType === 'deposit' ? cnDeposit('Type-Active') : cnDeposit('Type')} onClick={() => setSelectedType('deposit')}>
                        <Icon type='add' />
                        <Text>
                            Пополнение
                        </Text>
                    </button>
                    <button className={selectedType === 'withdraw' ? cnDeposit('Type-Active') : cnDeposit('Type')} onClick={() => setSelectedType('withdraw')}>
                        <Icon type='minus' />
                        <Text>
                            Вывод
                        </Text>
                    </button>
                    <button className={selectedType === 'history' ? cnDeposit('Type-Active') : cnDeposit('Type')} onClick={() => setSelectedType('history')}>
                        <Icon type='clock' />
                        <Text>
                            История
                        </Text>
                    </button>
                </div>
                <button type='button' onClick={() => close()} className={cnDeposit('Close')}>
                    <Icon type='close' />
                </button>
            </div>
           {selectedType === 'deposit' ? <Deposit/> : selectedType === 'withdraw' ? <Withdraw/>:<History/>}

                      

                
            
        </div>
    )
}

export default Transaction
