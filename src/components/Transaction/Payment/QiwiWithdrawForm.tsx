import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { Form } from 'react-final-form';

import s from './Payment.scss';
import { cn } from '../../../utils/bem-css-module';
import Scrollable from '../../Scrollable/Scrollable';
import useQiwiWithdrawStatsQuery from '../../../hooks/graphql/payments/useQiwiWithdrawStatsQuery';
import Text from '../../Text/Text';
import { QiwiLimit } from '../../../__generated__/graphql';

const cnPayment = cn(s, 'Payment');

interface QiwiTurnoverLimitProps {
    turnover: QiwiLimit;
}

const QiwiTurnoverLimit: React.FC<QiwiTurnoverLimitProps> = ({
    turnover: { currency, rest, max, spent, interval },
}) => {
    const dateFrom = new Date(interval.dateFrom).toLocaleDateString();
    const dateTill = new Date(interval.dateTill).toLocaleDateString();

    return (
        <li>
            Статистика по обороту на месяц ({dateFrom} — {dateTill}): {spent} / {max} (осталось {rest} {currency}).
        </li>
    );
};

const QiwiWithdrawForm: React.FC = () => {
    useStyles(s);

    const { qiwiWithdrawStats } = useQiwiWithdrawStatsQuery();

    const onSubmit = useCallback(() => {}, []);

    return (
        <Form onSubmit={onSubmit}>
            {({ handleSubmit }) => (
                <form className={cnPayment()} onSubmit={handleSubmit}>
                    <div className={cnPayment('Settings')}>
                        <Scrollable disablePadding>
                            <div>
                                <Text color="white">
                                    Информация о Qiwi-кошельке:
                                    <ul>
                                        {qiwiWithdrawStats?.turnover && (
                                            <QiwiTurnoverLimit turnover={qiwiWithdrawStats.turnover} />
                                        )}

                                        {(qiwiWithdrawStats?.restrictions?.length ?? 0) > 0 && (
                                            <li>
                                                Ограничения по исходящим платежам:
                                                <ul>
                                                    {qiwiWithdrawStats?.restrictions?.map(restriction => (
                                                        <li key={restriction}>{restriction}.</li>
                                                    ))}
                                                </ul>
                                            </li>
                                        )}

                                        <li>Баланс: {qiwiWithdrawStats?.balance} руб.</li>
                                    </ul>
                                </Text>
                            </div>
                        </Scrollable>
                    </div>
                </form>
            )}
        </Form>
    );
};

export default QiwiWithdrawForm;
