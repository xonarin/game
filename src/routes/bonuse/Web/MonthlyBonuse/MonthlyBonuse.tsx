import React, { useState } from 'react';
import ItemsCarousel from 'react-items-carousel';
import useStyles from 'isomorphic-style-loader/useStyles';
import { DateTime } from 'luxon';
import { moneyRound } from "../../../../utils/money";
import Icon from '../../../../components/Icon/Icon';
import TextInBox from '../../../../components/TextInBox/TextInBox';
import Button from '../../../../components/Button/Button';
import TextIcon from '../../../../components/TextIcon/TextIcon';
import PeopleCircles from '../../../welcome/Banner/PeopleCircles/PeopleCircles';
import s from './MonthlyBonuse.scss';
import { cn } from '../../../../utils/bem-css-module';
import Text from '../../../../components/Text/Text';
import useTournamentQuery from '../../../../hooks/graphql/tournaments/useTournamentQuery';
import { RefTournamentType } from '../../../../__generated__/graphql';

const cnMonthlyBonuse = cn(s, 'MonthlyBonuse');

const MonthlyBonuse = () => {
    useStyles(s);
    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const chevronWidth = 40;

    const { finish, users } = useTournamentQuery(RefTournamentType.Monthly);
    const nowDateTime = DateTime.local();
    const finishDateTime = DateTime.fromJSDate(new Date(finish || ''));
    const diffTime = finishDateTime.diff(nowDateTime, ['days', 'hours', 'minutes']).toObject();

    return (
        <div className={cnMonthlyBonuse('Content')}>
            <div className={cnMonthlyBonuse('Intro')}>
                <div className={cnMonthlyBonuse('Count')}>
                    <TextInBox size="xxl" color="white">
                        1
                    </TextInBox>
                    <TextInBox size="xxl" color="white">
                        0
                    </TextInBox>{' '}
                    <TextInBox size="xxl" color="white">
                        0
                    </TextInBox>{' '}
                    <TextInBox size="xxl" color="white">
                        0
                    </TextInBox>
                    <TextInBox size="xxl" color="white">
                        0
                    </TextInBox>
                    <TextInBox size="xxl" color="white">
                        <Icon type="diamond" size="m" />
                    </TextInBox>
                </div>

                <Text size="l" color="white" className={cnMonthlyBonuse('Intro-Text')}>
                    Каждый месяц мы разыгрываем 10.000 рублей среди игроков
                </Text>
                <Text color="white" className={cnMonthlyBonuse('Intro-Text')}>
                    Успей принять участие!
                </Text>
                <div className={cnMonthlyBonuse('Expires')}>
                    <Text size="xs" color="gold">
                        Истекает через:
                    </Text>
                    <Text size="xs" color="white">
                        {finishDateTime <= nowDateTime
                            ? '0 ДНЯ 0 ЧАС 0 МИНУТ'
                            : `${diffTime.days} ДНЯ ${diffTime.hours} ЧАС ${Math.ceil(diffTime.minutes || 0)} МИНУТ`}
                    </Text>
                </div>
            </div>
            <div className={cnMonthlyBonuse('Slider')}>
                <div style={{ padding: `0 ${chevronWidth}px`, width: '100%' }}>
                    <ItemsCarousel
                        requestToChangeActive={setActiveItemIndex}
                        activeItemIndex={activeItemIndex}
                        numberOfCards={6}
                        gutter={10}
                        leftChevron={<Icon type="left" />}
                        rightChevron={<Icon type="right" />}
                        outsideChevron
                        chevronWidth={chevronWidth}
                    >
                        {users.map((user, index) => (
                            <div className={cnMonthlyBonuse('SingleSlide')} key={index}>
                                <div
                                    className={cnMonthlyBonuse('WinnerAvatar')}
                                    style={{ backgroundImage: `url(${user.avatar})` }}
                                />
                                <div className={cnMonthlyBonuse('WinnerInfo')}>
                                    <Text className={cnMonthlyBonuse('WinnerName')} color="blue" upper>
                                        {user.username}
                                    </Text>
                                    <TextIcon
                                        className={cnMonthlyBonuse('Value')}
                                        text={moneyRound(user.amount)}
                                        icon="diamond"
                                        color="white"
                                        upper
                                    />
                                </div>
                            </div>
                        ))}
                    </ItemsCarousel>
                </div>
            </div>
        </div>
    );
};

export default MonthlyBonuse;
