import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Transaction.scss';
import { cn } from '../../utils/bem-css-module';
import Deposit from './Deposit/Deposit';
import Withdraw from './Withdraw/Withdraw';
import History from './History/History';
import Text from '../../components/Text/Text';
import Layout from '../../components/Layout/Layout';

const cnDeposit = cn(s, 'Deposit');

const TransactionMobile: React.FC = () => {
    const [selectedType, setSelectedType] = useState('deposit');
    useStyles(s);
    return (
        <Layout>
            <div className={cnDeposit()}>
                <div className={cnDeposit('Header')}>
                    <div className={cnDeposit('Types')}>
                        <button
                            className={selectedType === 'deposit' ? cnDeposit('Type-Active') : cnDeposit('Type')}
                            onClick={() => setSelectedType('deposit')}
                        >
                            <Text>Пополнение</Text>
                        </button>
                        <button
                            className={selectedType === 'withdraw' ? cnDeposit('Type-Active') : cnDeposit('Type')}
                            onClick={() => setSelectedType('withdraw')}
                        >
                            <Text>Вывод</Text>
                        </button>
                        <button
                            className={selectedType === 'history' ? cnDeposit('Type-Active') : cnDeposit('Type')}
                            onClick={() => setSelectedType('history')}
                        >
                            <Text>История</Text>
                        </button>
                    </div>
                </div>
                {selectedType === 'deposit' ? <Deposit /> : selectedType === 'withdraw' ? <Withdraw /> : <History />}
            </div>
        </Layout>
    );
};

export default TransactionMobile;
