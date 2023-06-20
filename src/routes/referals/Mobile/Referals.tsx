import React, { useContext, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Referals.scss';
import Text from '../../../components/Text/Text';
import Link from '../../../components/Link/Link';
import Button from '../../../components/Button/Button';
import { cn } from '../../../utils/bem-css-module';
import Icon from '../../../components/Icon/Icon';
import ReferalsTable from './ReferalsTable/ReferalsTable';
import Diagram from '../../../components/Diagram/Diagram';
import LayoutReferalMobile from '../../../components/Layout/Mobile/containers/LayoutReferalMobile';
import useReferralsStatsQuery from "../../../hooks/graphql/referrals/useReferralsStatsQuery";
import { RefStatsPeriod, RefStatsType } from '../../../__generated__/graphql';
import useReferralLinkQuery from '../../../hooks/graphql/referrals/useReferralLinkQuery';
import useGetReferralMoneyMutation from '../../../hooks/graphql/referrals/useGetReferralMoneyMutation';
import AppContext from '../../../context';

const cnReferal = cn(s, 'Referal');

const ReferalsMobile: React.FC = () => {
    const [amountPeriodType, setAmountPeriodType] = useState<RefStatsPeriod>(RefStatsPeriod.Month);
    const [referalsPeriodType, setReferalsPeriodType] = useState<RefStatsPeriod>(RefStatsPeriod.Month);
    const [referalsTypeToggle, setReferalsTypeToggle] = useState(false);
    const [amountToggle, setAmountToggle] = useState(false);

    const { fullAmount: amountFullAmount, mainValue: amountValue, entries: amountStats } = useReferralsStatsQuery(RefStatsType.Income, amountPeriodType);
    const { mainValue: countValue, entries: countStats } = useReferralsStatsQuery(RefStatsType.Count, referalsPeriodType);

    const { domain } = useContext(AppContext);
    const { referralLink } = useReferralLinkQuery(domain);
    const getReferralMoney = useGetReferralMoneyMutation();

    useStyles(s);

    const handleSelectFirstDiagram = (type: RefStatsPeriod) => {
        setAmountPeriodType(type);
    };

    const handleSelectSecondDiagram = (type: RefStatsPeriod) => {
        setReferalsPeriodType(type);
    };

    return (
        <LayoutReferalMobile
            TopContent={
                <div className={cnReferal('Header')}>
                    <nav className={cnReferal('Navigation')}>
                        <Link to="/referal" className={cnReferal('Navigation-Active')}>
                            <Text color="white" size="l">
                                ПАРТНЁРСКАЯ ПРОГРАММА
                            </Text>
                        </Link>
                    </nav>
                    <div className={cnReferal('Info')}>
                        <div className={cnReferal('Info-Title')}>
                            <Text color="white" size="xl">
                                Зарабатывайте легко на бонусах без вложений
                            </Text>
                            <Text color="white">Заработано: {amountFullAmount} ₽</Text>
                        </div>

                        <div className={cnReferal('Info-Link')}>
                            <div className={cnReferal('Info-Link-Main')}>
                                <Text color="white">Реферальная ссылка</Text>
                                <Text color="white">{referralLink}</Text>
                            </div>
                            <Icon type="link" />
                        </div>
                        <Text color="white" size='xs'>
                           Получайте до 15% с каждого пополнения реферала. <br />Чем больше рефералов, тем выше %<br /><br />
                        </Text>
                        <Button size="s" onClick={getReferralMoney}>Забрать деньги</Button>
                    </div>
                </div>
            }
            DiagramsIcon={
                <div className={cnReferal('Icon')}>
                    <Icon size="xxl" type="diagrams" />
                    <Text upper color="white" size="xl">
                        Статистика
                    </Text>
                </div>
            }
            FirstDiagram={
                <div className={cnReferal('Diagram-Container')}>
                    <div className={cnReferal('Diagram-Container-Header')}>
                        <div className={cnReferal('Diagram-Container-Header-Title')}>
                            <Icon type="balance" />
                            <Text>
                                ЗАРАБОТАНО: <Text color="green">{amountValue} ₽</Text>
                            </Text>
                        </div>

                        <div>
                            {amountPeriodType === RefStatsPeriod.Week ? (
                                <button
                                    type="button"
                                    className={cnReferal('Diagram-Btn-Active')}
                                    onClick={() => {
                                        handleSelectFirstDiagram(RefStatsPeriod.Week);
                                        setAmountToggle(!amountToggle);
                                    }}
                                >
                                    <Text>Неделя</Text>
                                </button>
                            ) : amountPeriodType === RefStatsPeriod.Month ? (
                                <button
                                    type="button"
                                    className={cnReferal('Diagram-Btn-Active')}
                                    onClick={() => {
                                        handleSelectFirstDiagram(RefStatsPeriod.Month);
                                        setAmountToggle(!amountToggle);
                                    }}
                                >
                                    <Text>месяц</Text>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={cnReferal('Diagram-Btn-Active')}
                                    onClick={() => {
                                        handleSelectFirstDiagram(RefStatsPeriod.Year);
                                        setAmountToggle(!amountToggle);
                                    }}
                                >
                                    <Text>Год</Text>
                                </button>
                            )}
                            {amountToggle ? (
                                <div className={cnReferal('Period')}>
                                    <button
                                        type="button"
                                        className={cnReferal('Diagram-Btn')}
                                        onClick={() => {
                                            handleSelectFirstDiagram(RefStatsPeriod.Week);
                                            setAmountToggle(!amountToggle);
                                        }}
                                    >
                                        <Text>Неделя</Text>
                                    </button>

                                    <button
                                        type="button"
                                        className={cnReferal('Diagram-Btn')}
                                        onClick={() => {
                                            handleSelectFirstDiagram(RefStatsPeriod.Month);
                                            setAmountToggle(!amountToggle);
                                        }}
                                    >
                                        <Text>месяц</Text>
                                    </button>

                                    <button
                                        type="button"
                                        className={cnReferal('Diagram-Btn')}
                                        onClick={() => {
                                            handleSelectFirstDiagram(RefStatsPeriod.Year);
                                            setAmountToggle(!amountToggle);
                                        }}
                                    >
                                        <Text>Год</Text>
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className={cnReferal('Diagram-Container-Content')}>
                        <Diagram color="#82ca9d" items={amountStats} mobile={true}/>
                    </div>
                </div>
            }
            SecondDiagram={
                <div className={cnReferal('Diagram-Container')}>
                    <div className={cnReferal('Diagram-Container-Header')}>
                        <div className={cnReferal('Diagram-Container-Header-Title')}>
                            <Icon type="peoples" />
                            <Text>
                                Привлечено:<Text color="green">{countValue}</Text>
                            </Text>
                        </div>

                        <div>
                            {referalsPeriodType === RefStatsPeriod.Week ? (
                                <button
                                    type="button"
                                    className={cnReferal('Diagram-Btn-Active')}
                                    onClick={() => {
                                        handleSelectSecondDiagram(RefStatsPeriod.Week);
                                        setReferalsTypeToggle(!referalsTypeToggle);
                                    }}
                                >
                                    <Text>Неделя</Text>
                                </button>
                            ) : referalsPeriodType === RefStatsPeriod.Month ? (
                                <button
                                    type="button"
                                    className={cnReferal('Diagram-Btn-Active')}
                                    onClick={() => {
                                        handleSelectSecondDiagram(RefStatsPeriod.Month);
                                        setReferalsTypeToggle(!referalsTypeToggle);
                                    }}
                                >
                                    <Text>месяц</Text>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={cnReferal('Diagram-Btn-Active')}
                                    onClick={() => {
                                        handleSelectSecondDiagram(RefStatsPeriod.Year);
                                        setReferalsTypeToggle(!referalsTypeToggle);
                                    }}
                                >
                                    <Text>Год</Text>
                                </button>
                            )}
                            {referalsTypeToggle ? (
                                <div className={cnReferal('Period')}>
                                    <button
                                        type="button"
                                        className={cnReferal('Diagram-Btn')}
                                        onClick={() => {
                                            handleSelectSecondDiagram(RefStatsPeriod.Week);
                                            setReferalsTypeToggle(!referalsTypeToggle);
                                        }}
                                    >
                                        <Text>Неделя</Text>
                                    </button>

                                    <button
                                        type="button"
                                        className={cnReferal('Diagram-Btn')}
                                        onClick={() => {
                                            handleSelectSecondDiagram(RefStatsPeriod.Month);
                                            setReferalsTypeToggle(!referalsTypeToggle);
                                        }}
                                    >
                                        <Text>месяц</Text>
                                    </button>

                                    <button
                                        type="button"
                                        className={cnReferal('Diagram-Btn')}
                                        onClick={() => {
                                            handleSelectSecondDiagram(RefStatsPeriod.Year);
                                            setReferalsTypeToggle(!referalsTypeToggle);
                                        }}
                                    >
                                        <Text>Год</Text>
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className={cnReferal('Diagram-Container-Content')}>
                        <Diagram color="#347dfe" items={countStats} mobile={true}/>
                    </div>
                </div>
            }
            TableIcons={
                <div className={cnReferal('Icon')}>
                    <Icon size="xxl" type="star" />
                    <Text upper color="white" size="xl">
                        РЕФЕРАЛЫ
                    </Text>
                </div>
            }
            ReferalTable={<ReferalsTable />}
        />
    );
};

export default ReferalsMobile;
