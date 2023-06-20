import React, { useCallback, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../../utils/bem-css-module';
import Icon from '../../Icon/Icon';
import Text from '../../Text/Text';
import Button from '../../Button/Button';
import { Withdraw, WithdrawStatus } from '../../../__generated__/graphql';
import s from './WithdrawHistoryItem.scss';
import useCancelWithdrawMutation from '../../../hooks/graphql/payments/useCancelWithdrawMutation';

export interface WithdrawHistoryItemProps {
    withdraw: Withdraw;
    mobile: boolean;
}

const cnWithdrawHistoryItem = cn(s, 'WithdrawHistoryItem');

const WithdrawHistoryItem: React.FC<WithdrawHistoryItemProps> = ({ mobile, withdraw }) => {
    const [toggle, setToggle] = useState(false);
    useStyles(s);

    const time = new Date(withdraw.createdAt).toLocaleString();

    const cancelWithdraw = useCancelWithdrawMutation();
    const onClick = useCallback(() => cancelWithdraw(withdraw.id), [cancelWithdraw, withdraw.id]);

    return (
        <div className={cnWithdrawHistoryItem({ mobile })}>
            <div className={cnWithdrawHistoryItem('Short-Info')}>
                <div className={cnWithdrawHistoryItem('Short-InfoLeft')} onClick={() => setToggle(old => !old)}>
                    <div className={cnWithdrawHistoryItem('Service')}>
                        <div className={cnWithdrawHistoryItem('Icon')}>
                            <img src={withdraw.method.avatar} alt={withdraw.method.name} />
                        </div>

                        <div className={cnWithdrawHistoryItem('Info')}>
                            <Text color="white">{withdraw.method.name}</Text>
                            <Text color="white">#{withdraw.id}</Text>
                        </div>
                    </div>

                    <div className={cnWithdrawHistoryItem('Time')}>
                        <Text color="white">{time}</Text>
                    </div>

                    <div className={cnWithdrawHistoryItem('Amount')}>
                        <Text color="white">
                            {withdraw.amount} <Icon type="diamond" />
                        </Text>
                    </div>
                </div>

                <div className={cnWithdrawHistoryItem('Status')}>
                    {withdraw.status === WithdrawStatus.WaitApprove && (
                        <Button className={cnWithdrawHistoryItem('Status')} onClick={onClick}>
                            Отменить
                        </Button>
                    )}

                    {[WithdrawStatus.Approved, WithdrawStatus.InProgress].includes(withdraw.status) && (
                        <Button className={cnWithdrawHistoryItem('Status')} color="orange">
                            В работе
                        </Button>
                    )}

                    {withdraw.status === WithdrawStatus.Success && (
                        <Button className={cnWithdrawHistoryItem('Status')} color="green">
                            Выплачено
                        </Button>
                    )}

                    {withdraw.status === WithdrawStatus.Cancelled && (
                        <Button className={cnWithdrawHistoryItem('Status')} color="gray">
                            Отменено
                        </Button>
                    )}

                    {withdraw.status === WithdrawStatus.BadPurse && (
                        <Button className={cnWithdrawHistoryItem('Status')} color="gray">
                            Неверный номер кошелька
                        </Button>
                    )}
                </div>
            </div>

            {toggle ? (
                <div className={cnWithdrawHistoryItem('Description')}>
                    <Text color="white">
                        Сумма пополнения: {withdraw.amount} <Icon type="diamond" size="xs" />
                    </Text>
                    <Text color="white">Время пополения: {time}</Text>
                </div>
            ) : null}
        </div>
    );
};

export default WithdrawHistoryItem;
