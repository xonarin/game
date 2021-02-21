import React, { useContext, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Referals.scss';
import Text from '../../../components/Text/Text';
import Link from '../../../components/Link/Link';
import Button from '../../../components/Button/Button';
import { cn } from '../../../utils/bem-css-module';
import LayoutReferal from '../../../components/Layout/Web/containers/LayoutReferal';
import Icon from '../../../components/Icon/Icon';
import ReferalsTable from './ReferalsTable/ReferalsTable'
import Diagram from '../../../components/Diagram/Diagram'
import useReferralsStatsQuery from '../../../hooks/graphql/referrals/useReferralsStatsQuery';
import { RefStatsPeriod, RefStatsType } from '../../../__generated__/graphql';
import useReferralLinkQuery from '../../../hooks/graphql/referrals/useReferralLinkQuery';
import useGetReferralMoneyMutation from '../../../hooks/graphql/referrals/useGetReferralMoneyMutation';
import AppContext from '../../../context';

const cnReferal = cn(s, 'Referal');

const ReferalsWeb: React.FC = () => {
    const [amountPeriodType, setAmountPeriodType] = useState<RefStatsPeriod>(RefStatsPeriod.Month);
    const [referalsPeriodType, setReferalsPeriodType] = useState<RefStatsPeriod>(RefStatsPeriod.Month);

    const { fullAmount: amountFullAmount, mainValue: amountValue, entries: amountStats } = useReferralsStatsQuery(RefStatsType.Income, amountPeriodType);
    const { mainValue: countValue, entries: countStats } = useReferralsStatsQuery(RefStatsType.Count, referalsPeriodType);

    const { domain } = useContext(AppContext);
    const { referralLink } = useReferralLinkQuery(domain);
    const getReferralMoney = useGetReferralMoneyMutation();

    useStyles(s);

    return (
        <LayoutReferal
            TopContent={
                <div className={cnReferal("Header")}>
                    <nav className={cnReferal("Navigation")}>
                        <Link to="/referal" className={cnReferal("Navigation-Active")}>
                            <Text color='white' size='l'>
                                ПАРТНЁРСКАЯ ПРОГРАММА
                            </Text>
                        </Link>
                        <Link to="/referal">
                            МОЙ ПРОФИЛЬ
                        </Link>
                    </nav>
                    <div className={cnReferal("Info")}>
                        <div className={cnReferal("Info-Title")}>
                            <Text color='white' size='xxl'>
                                Зарабатывайте легко на бонусах без вложений
                            </Text>
                            <Text color="white">
                                Заработано: {amountFullAmount} ₽
                            </Text>
                        </div>

                        <div className={cnReferal("Info-Link")}>
                            <div className={cnReferal("Info-Link-Main")}>
                                <Text color='white'>
                                    Реферальная ссылка
                                </Text>
                                <Text color='white'>
                                    {referralLink}
                                </Text>
                            </div>
                            <Icon type='link' />
                        </div>
                            <Text color="white" size='xs'>
                                Получайте до 15% с каждого пополнения реферала. <br />Чем больше рефералов, тем выше %<br /><br />
                            </Text>
                        <div />
                        <Button size="s" onClick={getReferralMoney}>Забрать деньги</Button>
                    </div>
                </div>
            }
            DiagramsIcon={
                <div className={cnReferal("Icon")}>
                    <Icon size='xxl' type='diagrams' />
                    <Text upper color='white' size='xl'>Статистика</Text>
                </div>
            }
            LeftContent={
                <div className={cnReferal("Diagram-Container")}>
                    <div className={cnReferal("Diagram-Container-Header")}>
                        <div className={cnReferal("Diagram-Container-Header-Title")}>
                        <Icon  type='balance' />
                        <Text>
                            ЗАРАБОТАНО: <Text color='green'>{amountValue} ₽</Text>
                        </Text>
                        </div>

                        <div>
                            <button type='button' className={cnReferal(amountPeriodType === RefStatsPeriod.Week ? "Diagram-Btn-Active" : "Diagram-Btn")} onClick={() => setAmountPeriodType(RefStatsPeriod.Week)}><Text>Неделя</Text></button >
                            <button type='button' className={cnReferal(amountPeriodType === RefStatsPeriod.Month ? "Diagram-Btn-Active" : "Diagram-Btn")} onClick={() => setAmountPeriodType(RefStatsPeriod.Month)}><Text>месяц</Text></button >
                            <button type='button' className={cnReferal(amountPeriodType === RefStatsPeriod.Year ? "Diagram-Btn-Active" : "Diagram-Btn")} onClick={() => setAmountPeriodType(RefStatsPeriod.Year)}><Text>Год</Text></button >
                        </div>
                    </div>
                    <div className={cnReferal("Diagram-Container-Content")}>
                        <Diagram items={amountStats} color="#82ca9d"/>
                    </div>
                </div>
            }
            RightContent={
                <div className={cnReferal("Diagram-Container")}>
                <div className={cnReferal("Diagram-Container-Header")}>
                    <div className={cnReferal("Diagram-Container-Header-Title")}>
                    <Icon type='peoples' />
                    <Text>
                        Привлечено: <Text color='green'>{countValue}</Text>
                    </Text>
                    </div>

                    <div>
                        <button type='button' className={cnReferal(referalsPeriodType === RefStatsPeriod.Week ? "Diagram-Btn-Active" : "Diagram-Btn")} onClick={() => setReferalsPeriodType(RefStatsPeriod.Week)}><Text>Неделя</Text></button >
                        <button type='button' className={cnReferal(referalsPeriodType === RefStatsPeriod.Month ? "Diagram-Btn-Active" : "Diagram-Btn")} onClick={() => setReferalsPeriodType(RefStatsPeriod.Month)}><Text>месяц</Text></button >
                        <button type='button' className={cnReferal(referalsPeriodType === RefStatsPeriod.Year ? "Diagram-Btn-Active" : "Diagram-Btn")} onClick={() => setReferalsPeriodType(RefStatsPeriod.Year)}><Text>Год</Text></button >
                    </div>
                </div>
                <div className={cnReferal("Diagram-Container-Content")}>
                    <Diagram items={countStats} color="#347dfe"/>
                </div>
            </div>
            }
            TableIcons={
                <div className={cnReferal("Icon")}>
                    <Icon size='xxl'  type='star' />
                    <Text upper color='white' size='xl'>РЕФЕРАЛЫ</Text>
                </div>
            }
            BottomContent={
                <ReferalsTable />
            }
        />
    );
};

export default ReferalsWeb;
