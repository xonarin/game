import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

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

    const { users } = useTournamentQuery(RefTournamentType.Monthly);

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
                <div className={cnMonthlyBonuse('Description')}>
                    <Text line="xl" color="white" className={cnMonthlyBonuse('Intro-Text')}>
                        Каждый месяц мы разыгрываем 10.000 рублей среди игроков
                    </Text>
                </div>

                <Text color="white" className={cnMonthlyBonuse('Intro-Text')}>
                    Успей принять участие!
                </Text>
                <Button size="m">Участвовать</Button>
                <div className={cnMonthlyBonuse('PeopleCircles')}>
                    <Text color="white">участвуют:</Text>
                    <PeopleCircles />
                    <Text size="m" color="green">
                        +583K
                    </Text>
                </div>
            </div>
            <div className={cnMonthlyBonuse('Slider')}>
                {users.map((user, index) => (
                    <div className={cnMonthlyBonuse('SingleSlide')} key={index}>
                        <div className={cnMonthlyBonuse('WinnerAvatar')} />
                        <div className={cnMonthlyBonuse('WinnerInfo')}>
                            <Text className={cnMonthlyBonuse('WinnerName')} color="blue" upper>
                                {user.username}
                            </Text>
                            <TextIcon
                                className={cnMonthlyBonuse('Value')}
                                text={user.amount}
                                icon="diamond"
                                color="white"
                                upper
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MonthlyBonuse;