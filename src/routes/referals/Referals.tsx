import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Referals.scss';
import Text from '../../components/Text/Text';
import Link from '../../components/Link/Link';
import { cn } from '../../utils/bem-css-module';
import LayoutReferal from '../../components/Layout/Web/containers/LayoutReferal';
import Icon from '../../components/Icon/Icon';
import ReferalsTable from './ReferalsTable/ReferalsTable'
import Diagram from '../../components/Diagram/Diagram'

const cnReferal = cn(s, 'Referal');

const items = [
    { id: 1,  user: 'Donald', count: 36, status: true, income: 2500, date: '25.10.2019 в 21:46' },
    { id: 2,  user: 'Donald', count: 67, status: false, income: 2500, date: '25.10.2019 в 21:46' },
    { id: 3,  user: 'Donald', count: 10, status: true, income: 2500, date: '25.10.2019 в 21:46' },
    { id: 4,  user: 'Donald', count: 83, status: false, income: 2500, date: '25.10.2019 в 21:46' },
    { id: 5,  user: 'Donald', count: 67, status: true, income: 2500, date: '25.10.2019 в 21:46' },
    { id: 6,  user: 'Donald', count: 36, status: true, income: 2500, date: '25.10.2019 в 21:46' },
];

const Referals: React.FC = () => {
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
                            МОИ ПРОФИЛЬ
                        </Link>
                    </nav>
                    <div className={cnReferal("Info")}>
                        <div className={cnReferal("Info-Title")}>
                            <Text color='white' size='xxl'>
                                Зарабатывайте легко на бонусах без вложений
                        </Text>
                            <Text color="white">
                                Заработано:  5000 ₽
                        </Text>
                        </div>

                        <div className={cnReferal("Info-Link")}>
                            <div className={cnReferal("Info-Link-Main")}>
                                <Text color='white'>
                                    Реферальная ссылка
                                </Text>
                                <Text color='white'>
                                    domein.io/ref69522
                                </Text>
                            </div>
                            <Icon type='link' />
                        </div>
                    </div>
                </div>
            }
            DiagramsIcon={
                <div className={cnReferal("Icon")}>
                    <Icon size='xxl' type='diagrams' />
                    <Text upper color='white' size='xl'>СТАТИстики</Text>
                </div>
            }
            LeftContent={
                <div className={cnReferal("Diagram-Container")}>
                    <div className={cnReferal("Diagram-Container-Header")}>
                        <div className={cnReferal("Diagram-Container-Header-Title")}>
                        <Icon  type='balance' />
                        <Text>
                            ЗАРАБОТАНО:<Text color='green'>3850 ₽</Text>
                        </Text>
                        </div>
                      
                        <div>
                            <button type='button' className={cnReferal("Diagram-Btn-Active")}><Text>Неделя</Text></button >
                            <button type='button' className={cnReferal("Diagram-Btn")}><Text>месяц</Text></button >
                            <button type='button' className={cnReferal("Diagram-Btn")}><Text>Год</Text></button >
                        </div>
                    </div>
                    <div className={cnReferal("Diagram-Container-Content")}>
                            <Diagram color="#82ca9d"/>
                    </div>
                </div>
            }
            RightContent={
                <div className={cnReferal("Diagram-Container")}>
                <div className={cnReferal("Diagram-Container-Header")}>
                    <div className={cnReferal("Diagram-Container-Header-Title")}>
                    <Icon type='peoples' />
                    <Text>
                        ЗАРАБОТАНО:<Text color='green'>3850 ₽</Text>
                    </Text>
                    </div>
                  
                    <div>
                        <button type='button' className={cnReferal("Diagram-Btn-Active")}><Text>Неделя</Text></button >
                        <button type='button' className={cnReferal("Diagram-Btn")}><Text>месяц</Text></button >
                        <button type='button' className={cnReferal("Diagram-Btn")}><Text>Год</Text></button >
                    </div>
                </div>
                <div className={cnReferal("Diagram-Container-Content")}>
                    <Diagram color="#347dfe"/>
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
                <ReferalsTable items={items}/>
            }
        />
    );
};

export default Referals;
