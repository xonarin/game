import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Referals.scss';
import Text from '../../../components/Text/Text';
import Link from '../../../components/Link/Link';
import { cn } from '../../../utils/bem-css-module';
import LayoutReferal from '../../../components/Layout/Web/containers/LayoutReferal';
import Icon from '../../../components/Icon/Icon';
import ReferalsTable from './ReferalsTable/ReferalsTable';
import Diagram from '../../../components/Diagram/Diagram';
import useIsomorphicLayoutEffect from '../../../hooks/useIsomorphicLayoutEffect';
import LayoutReferalMobile from '../../../components/Layout/Mobile/containers/LayoutReferalMobile';

const cnReferal = cn(s, 'Referal');

const items = [
    { id: 1, user: 'Donald', count: 36, status: true, income: 2500, date: '25.10.2019 в 21:46' },
    { id: 2, user: 'Donald', count: 67, status: false, income: 2500, date: '26.10.2019 в 21:46' },
    { id: 3, user: 'Donald', count: 10, status: true, income: 2500, date: '27.10.2019 в 21:46' },
    { id: 4, user: 'Donald', count: 83, status: false, income: 2500, date: '28.10.2019 в 21:46' },
    { id: 5, user: 'Donald', count: 67, status: true, income: 2500, date: '29.10.2019 в 21:46' },
    { id: 6, user: 'Donald', count: 36, status: true, income: 2500, date: '30.10.2019 в 21:46' },
    { id: 7, user: 'Donald', count: 83, status: false, income: 2500, date: '28.10.2019 в 21:46' },
    { id: 8, user: 'Donald', count: 67, status: true, income: 2500, date: '29.10.2019 в 21:46' },
    { id: 9, user: 'Donald', count: 36, status: true, income: 2500, date: '30.10.2019 в 21:46' },
];

const ReferalsMobile: React.FC = () => {
    const [mobile, setMobile] = useState(false);
    const [amountPeriodType, setAmountPeriodType] = useState('week');
    const [referalsPeriodType, setReferalsPeriodType] = useState('week');
    const [referalsTypeToggle, setReferalsTypeToggle] = useState(false);
    const [amountToggle, setAmountToggle] = useState(false);
    useIsomorphicLayoutEffect(() => {
        if (
            typeof window !== 'undefined' &&
            typeof window.document !== 'undefined' &&
            typeof window.document.createElement !== 'undefined' &&
            window.screen.width < 900
        ) {
            setMobile(true);
        }
    }, [typeof window !== 'undefined' && window?.screen?.width]);

    useStyles(s);
    const handleSelectFirstDiagram = (type: string) => {
        setAmountPeriodType(type);
    };

    const handleSelectSecondDiagram = (type: string) => {
        setReferalsPeriodType(type);
    };
    if (mobile) {
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
                                <Text color="white">Заработано: 5000 ₽</Text>
                            </div>

                            <div className={cnReferal('Info-Link')}>
                                <div className={cnReferal('Info-Link-Main')}>
                                    <Text color="white">Реферальная ссылка</Text>
                                    <Text color="white">domein.io/ref69522</Text>
                                </div>
                                <Icon type="link" />
                            </div>
                        </div>
                    </div>
                }
                DiagramsIcon={
                    <div className={cnReferal('Icon')}>
                        <Icon size="xxl" type="diagrams" />
                        <Text upper color="white" size="xl">
                            СТАТИстики
                        </Text>
                    </div>
                }
                FirstDiagram={
                    <div className={cnReferal('Diagram-Container')}>
                        <div className={cnReferal('Diagram-Container-Header')}>
                            <div className={cnReferal('Diagram-Container-Header-Title')}>
                                <Icon type="balance" />
                                <Text>
                                    ЗАРАБОТАНО:<Text color="green">3850 ₽</Text>
                                </Text>
                            </div>

                            <div>
                                {amountPeriodType === 'week' ? (
                                    <button
                                        type="button"
                                        className={cnReferal('Diagram-Btn-Active')}
                                        onClick={() => {
                                            handleSelectFirstDiagram('week');
                                            setAmountToggle(!amountToggle);
                                        }}
                                    >
                                        <Text>Неделя</Text>
                                    </button>
                                ) : amountPeriodType === 'month' ? (
                                    <button
                                        type="button"
                                        className={cnReferal('Diagram-Btn-Active')}
                                        onClick={() => {
                                            handleSelectFirstDiagram('month');
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
                                            handleSelectFirstDiagram('year');
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
                                                handleSelectFirstDiagram('week');
                                                setAmountToggle(!amountToggle);
                                            }}
                                        >
                                            <Text>Неделя</Text>
                                        </button>

                                        <button
                                            type="button"
                                            className={cnReferal('Diagram-Btn')}
                                            onClick={() => {
                                                handleSelectFirstDiagram('month');
                                                setAmountToggle(!amountToggle);
                                            }}
                                        >
                                            <Text>месяц</Text>
                                        </button>

                                        <button
                                            type="button"
                                            className={cnReferal('Diagram-Btn')}
                                            onClick={() => {
                                                handleSelectFirstDiagram('year');
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
                            <Diagram color="#82ca9d" mobile={true}/>
                        </div>
                    </div>
                }
                SecondDiagram={
                    <div className={cnReferal('Diagram-Container')}>
                        <div className={cnReferal('Diagram-Container-Header')}>
                            <div className={cnReferal('Diagram-Container-Header-Title')}>
                                <Icon type="peoples" />
                                <Text>
                                    ЗАРАБОТАНО:<Text color="green">3850 ₽</Text>
                                </Text>
                            </div>

                            <div>
                                {referalsPeriodType === 'week' ? (
                                    <button
                                        type="button"
                                        className={cnReferal('Diagram-Btn-Active')}
                                        onClick={() => {
                                            handleSelectSecondDiagram('week');
                                            setReferalsTypeToggle(!referalsTypeToggle);
                                        }}
                                    >
                                        <Text>Неделя</Text>
                                    </button>
                                ) : referalsPeriodType === 'month' ? (
                                    <button
                                        type="button"
                                        className={cnReferal('Diagram-Btn-Active')}
                                        onClick={() => {
                                            handleSelectSecondDiagram('month');
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
                                            handleSelectSecondDiagram('year');
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
                                                handleSelectSecondDiagram('week');
                                                setReferalsTypeToggle(!referalsTypeToggle);
                                            }}
                                        >
                                            <Text>Неделя</Text>
                                        </button>

                                        <button
                                            type="button"
                                            className={cnReferal('Diagram-Btn')}
                                            onClick={() => {
                                                handleSelectSecondDiagram('month');
                                                setReferalsTypeToggle(!referalsTypeToggle);
                                            }}
                                        >
                                            <Text>месяц</Text>
                                        </button>

                                        <button
                                            type="button"
                                            className={cnReferal('Diagram-Btn')}
                                            onClick={() => {
                                                handleSelectSecondDiagram('year');
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
                            <Diagram color="#347dfe" mobile={true}/>
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
            ></LayoutReferalMobile>
        );
    }

    return (
        <LayoutReferal
            TopContent={
                <div className={cnReferal('Header')}>
                    <nav className={cnReferal('Navigation')}>
                        <Link to="/referal" className={cnReferal('Navigation-Active')}>
                            <Text color="white" size="l">
                                ПАРТНЁРСКАЯ ПРОГРАММА
                            </Text>
                        </Link>
                        <Link to="/referal">МОИ ПРОФИЛЬ</Link>
                    </nav>
                    <div className={cnReferal('Info')}>
                        <div className={cnReferal('Info-Title')}>
                            <Text color="white" size="xxl">
                                Зарабатывайте легко на бонусах без вложений
                            </Text>
                            <Text color="white">Заработано: 5000 ₽</Text>
                        </div>

                        <div className={cnReferal('Info-Link')}>
                            <div className={cnReferal('Info-Link-Main')}>
                                <Text color="white">Реферальная ссылка</Text>
                                <Text color="white">domein.io/ref69522</Text>
                            </div>
                            <Icon type="link" />
                        </div>
                    </div>
                </div>
            }
            DiagramsIcon={
                <div className={cnReferal('Icon')}>
                    <Icon size="xxl" type="diagrams" />
                    <Text upper color="white" size="xl">
                        СТАТИстики
                    </Text>
                </div>
            }
            LeftContent={
                <div className={cnReferal('Diagram-Container')}>
                    <div className={cnReferal('Diagram-Container-Header')}>
                        <div className={cnReferal('Diagram-Container-Header-Title')}>
                            <Icon type="balance" />
                            <Text>
                                ЗАРАБОТАНО:<Text color="green">3850 ₽</Text>
                            </Text>
                        </div>

                        <div>
                            <button type="button" className={cnReferal('Diagram-Btn-Active')}>
                                <Text>Неделя</Text>
                            </button>
                            <button type="button" className={cnReferal('Diagram-Btn')}>
                                <Text>месяц</Text>
                            </button>
                            <button type="button" className={cnReferal('Diagram-Btn')}>
                                <Text>Год</Text>
                            </button>
                        </div>
                    </div>
                    <div className={cnReferal('Diagram-Container-Content')}>
                        <Diagram color="#82ca9d" />
                    </div>
                </div>
            }
            RightContent={
                <div className={cnReferal('Diagram-Container')}>
                    <div className={cnReferal('Diagram-Container-Header')}>
                        <div className={cnReferal('Diagram-Container-Header-Title')}>
                            <Icon type="peoples" />
                            <Text>
                                ЗАРАБОТАНО:<Text color="green">3850 ₽</Text>
                            </Text>
                        </div>

                        <div>
                            <button type="button" className={cnReferal('Diagram-Btn-Active')}>
                                <Text>Неделя</Text>
                            </button>
                            <button type="button" className={cnReferal('Diagram-Btn-Active')}>
                                <Text>месяц</Text>
                            </button>
                            <button type="button" className={cnReferal('Diagram-Btn-Active')}>
                                <Text>Год</Text>
                            </button>
                        </div>
                    </div>
                    <div className={cnReferal('Diagram-Container-Content')}>
                        <Diagram color="#347dfe" />
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
            BottomContent={<ReferalsTable />}
        />
    );
};

export default ReferalsMobile;