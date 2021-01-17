import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../../utils/bem-css-module';
import Icon from '../../Icon/Icon';
import Text from '../../Text/Text';
import s from './DepositHistoryItem.scss';
import { Payment } from '../../../__generated__/graphql';

export interface DepositHistoryItemProps {
    readonly payment: Payment;
}

const cnDepositHistoryItem = cn(s, 'DepositHistoryItem');

const DepositHistoryItem: React.FC<DepositHistoryItemProps> = ({ payment }) => {
    const [toggle, setToggle] = useState(false);
    useStyles(s);

    const time = new Date(payment.createdAt).toLocaleString();

    return (
        <div className={cnDepositHistoryItem()}>
            <div className={cnDepositHistoryItem('Short-Info')} onClick={() => setToggle(old => !old)}>
                <div className={cnDepositHistoryItem('Service')}>
                    <div className={cnDepositHistoryItem('Icon')}>
                        {payment.method ? (
                            <img src={payment.method.avatar} alt={payment.method.name} />
                        ) : (
                            <Icon type="diamond" />
                        )}
                    </div>

                    <div className={cnDepositHistoryItem('Info')}>
                        <Text color="white">{payment.method?.name || 'Пополнение'}</Text>
                        <Text color="white">#{payment.id}</Text>
                    </div>
                </div>

                <div className={cnDepositHistoryItem('Time')}>
                    <Text color="white">{time}</Text>
                </div>

                <div className={cnDepositHistoryItem('Amount')}>
                    <Text color="white">
                        {payment.amount} <Icon type="diamond" />
                    </Text>
                </div>
            </div>

            {toggle && (
                <div className={cnDepositHistoryItem('Description')}>
                    <Text color="white">
                        Сумма пополнения: {payment.amount} <Icon type="diamond" size="xs" />
                    </Text>

                    <Text color="white">Время пополения: {time}</Text>
                </div>
            )}
        </div>
    );
};

export default DepositHistoryItem;
