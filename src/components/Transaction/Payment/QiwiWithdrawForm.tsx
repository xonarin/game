import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { Form } from 'react-final-form';

import s from './Payment.scss';
import { cn } from '../../../utils/bem-css-module';
import Scrollable from '../../Scrollable/Scrollable';
import useQiwiWithdrawStatsQuery from '../../../hooks/graphql/payments/useQiwiWithdrawStatsQuery';

const cnPayment = cn(s, 'Payment');

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
                                Статистика по обороту на месяц:
                                <pre>{qiwiWithdrawStats?.turnover}</pre>
                                {(qiwiWithdrawStats?.restrictions?.length ?? 0) > 0 && (
                                    <>
                                        Ограничения по исходящим платежам:
                                        <pre>{qiwiWithdrawStats?.restrictions}</pre>
                                    </>
                                )}
                                Баланс Qiwi-кошелька:
                                <pre>{qiwiWithdrawStats?.balance}</pre>
                            </div>
                        </Scrollable>
                    </div>
                </form>
            )}
        </Form>
    );
};

export default QiwiWithdrawForm;
