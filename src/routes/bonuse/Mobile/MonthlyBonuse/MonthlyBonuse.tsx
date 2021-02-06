import React from 'react';
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
import BonuseTablePlayer from '../BonuseTable/BonuseTablePlayer';
import useTournamentQuery from '../../../../hooks/graphql/tournaments/useTournamentQuery';
import { RefTournamentType } from '../../../../__generated__/graphql';

const cnMonthlyBonuse = cn(s, 'MonthlyBonuse');

const MonthlyBonuse = () => {
    useStyles(s);

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
                <div className={cnMonthlyBonuse('Description')}>
                    <Text line="xl" color="white" className={cnMonthlyBonuse('Intro-Text')}>
                        Каждый месяц мы разыгрываем 10.000 рублей среди игроков
                    </Text>
                </div>

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

            <BonuseTablePlayer
                items={
                    users?.map((user, index) => ({
                        id: index + 1,
                        avatar: user.avatar,
                        winner: user.username,
                        point: moneyRound(user.amount),
                        fund: user.prize,
                    })) || []
                }
            />
        </div>
    );
};

export default MonthlyBonuse;
