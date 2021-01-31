import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from '../Payment.scss';
import { cn } from '../../../../utils/bem-css-module';
import useQiwiWithdrawStatsQuery from '../../../../hooks/graphql/payments/useQiwiWithdrawStatsQuery';
import { QiwiLimit } from '../../../../__generated__/graphql';
import Text from '../../../Text/Text';
import CornerLabel from '../CornerLabel/CornerLabel';

interface QiwiTurnoverLimitProps {
    turnover: QiwiLimit;
}

const cnPayment = cn(s, 'Payment');

const QiwiTurnoverLimit: React.FC<QiwiTurnoverLimitProps> = ({
    turnover: { currency, rest, max, spent, interval },
}) => {
    const dateFrom = new Date(interval.dateFrom).toLocaleDateString();
    const dateTill = new Date(interval.dateTill).toLocaleDateString();

    return (
        <li>
            Статистика по обороту на месяц (
            <Text color="white">
                {dateFrom} — {dateTill}
            </Text>
            {'): '}
            <Text color="white">
                {spent} / {max}
            </Text>
            {' (осталось '}
            <Text color="white">
                {rest} {currency}
            </Text>
            ).
        </li>
    );
};

const QiwiWithdrawStats: React.FC = () => {
    useStyles(s);

    const { loading, qiwiWithdrawStats, refetch } = useQiwiWithdrawStatsQuery();
    const onRefreshClick = useCallback(() => refetch(), [refetch]);

    return (
        <Text>
            <CornerLabel>
                Информация о Qiwi-кошельке:{' '}
                <button
                    className={cnPayment('RefreshButton')}
                    type="button"
                    onClick={onRefreshClick}
                    disabled={loading}
                >
                    (обновить)
                </button>
            </CornerLabel>

            <ul>
                {qiwiWithdrawStats?.turnover && <QiwiTurnoverLimit turnover={qiwiWithdrawStats.turnover} />}

                {qiwiWithdrawStats?.restrictions && (
                    <li>
                        Ограничения по исходящим платежам:
                        {qiwiWithdrawStats.restrictions.length === 0 && (
                            <>
                                <Text color="white"> нет</Text>.
                            </>
                        )}
                        <ul>
                            {qiwiWithdrawStats.restrictions.map(restriction => (
                                <Text color="white">
                                    <li key={restriction}>{restriction}.</li>
                                </Text>
                            ))}
                        </ul>
                    </li>
                )}

                <li>
                    Баланс: <Text color="white">{qiwiWithdrawStats?.balance} руб</Text>.
                </li>
            </ul>

            <hr />
        </Text>
    );
};

export default QiwiWithdrawStats;
