import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { DateTime } from 'luxon';
import { moneyRound } from "../../../../utils/money";
import s from './BonuseBanner.scss';
import { cn } from '../../../../utils/bem-css-module';
import Text from '../../../../components/Text/Text';
import TextInBox from '../../../../components/TextInBox/TextInBox';
import Icon from '../../../../components/Icon/Icon';
import BonuseTablePlayer from '../BonuseTable/BonuseTablePlayer';
import useTournamentQuery from '../../../../hooks/graphql/tournaments/useTournamentQuery';
import { RefTournamentType } from '../../../../__generated__/graphql';

export interface BonuseBannerPlayerMobileProps {
    title: string;
    description: string | React.ReactNode;
    count: string;
}
const cnBonuseBannerMobile = cn(s, 'BonuseBanner');

const BonuseBannerPlayerMobile: React.FC<BonuseBannerPlayerMobileProps> = ({ description, count }) => {
    useStyles(s);

    const { position, amount, finish, users } = useTournamentQuery(RefTournamentType.Activity);
    const nowDateTime = DateTime.local();
    const finishDateTime = DateTime.fromJSDate(new Date(finish || ''));
    const diffTime = finishDateTime.diff(nowDateTime, ['days', 'hours', 'minutes']).toObject();
    const amountRound = moneyRound(amount);
    return (
        <div className={cnBonuseBannerMobile()}>
            <div className={cnBonuseBannerMobile('Header')}>
                <div className={cnBonuseBannerMobile('Header-Info')}>
                    <div className={cnBonuseBannerMobile('Header-Info-Count')}>
                        {[...count].map(number => {
                            return (
                                <TextInBox size="xxl" color="white">
                                    {number}
                                </TextInBox>
                            );
                        })}
                        <TextInBox size="xxl" color="white">
                            <Icon type="diamond" size="m" />
                        </TextInBox>
                    </div>
                    <Text className={cnBonuseBannerMobile('Header-Description')} line="xl" color="white">
                        {description}{' '}
                    </Text>

                    <div className={cnBonuseBannerMobile('Header-Expires')}>
                        <Text size="xs" color="gold">
                            Истекает через:
                        </Text>
                        <Text size="xs" color="white">
                            {finishDateTime <= nowDateTime
                                ? '0 ДНЯ 0 ЧАС 0 МИНУТ'
                                : `${diffTime.days} ДНЯ ${diffTime.hours} ЧАС ${Math.ceil(
                                      diffTime.minutes || 0,
                                  )} МИНУТ`}
                        </Text>
                    </div>
                </div>
            </div>
            <div className={cnBonuseBannerMobile('Main')}>
                <div className={cnBonuseBannerMobile('Main-Rating')}>
                    <Icon type="diceWhite" />
                    <Text color="white">
                        {position !== 0 ? (
                            <>
                                Вы на <Text color="green">{position}м</Text> месте
                            </>
                        ) : (
                            <>Вы не в игре</>
                        )}
                    </Text>
                </div>
                <div className={cnBonuseBannerMobile('Main-Rating')}>
                    <Icon type="diceWhite" />
                    <Text color="white">
                        Набрано <Text color="green">{amountRound}</Text> баллов
                    </Text>
                </div>
            </div>
            <div className={cnBonuseBannerMobile('Table')}>
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
        </div>
    );
};

export default BonuseBannerPlayerMobile;
