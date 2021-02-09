import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { DateTime } from 'luxon';

import s from './BonuseBanner.scss';
import { cn } from '../../../../utils/bem-css-module';
import Text from '../../../../components/Text/Text';
import TextInBox from '../../../../components/TextInBox/TextInBox';
import Icon from '../../../../components/Icon/Icon';
import BonuseTableReferal from '../BonuseTable/BonuseTableReferal';
import useTournamentQuery from '../../../../hooks/graphql/tournaments/useTournamentQuery';
import { RefTournamentType } from '../../../../__generated__/graphql';

export interface BonuseBannerReferalProps {
    title: string;
    description: string | React.ReactNode;
    count: string;
}
const cnBonuseBanner = cn(s, 'BonuseBanner');

const BonuseBannerReferal: React.FC<BonuseBannerReferalProps> = ({ title, description, count }) => {
    useStyles(s);

    const { position, amount, finish, users } = useTournamentQuery(RefTournamentType.Referrals);
    const nowDateTime = DateTime.local();
    const finishDateTime = DateTime.fromJSDate(new Date(finish || ''));
    const diffTime = finishDateTime.diff(nowDateTime, ['days', 'hours', 'minutes']).toObject();

    return (
        <div className={cnBonuseBanner()}>
            <div className={cnBonuseBanner('Header')}>
                <Text upper color="white" size="xxl" className={cnBonuseBanner('Header-Title')}>
                    {title}
                </Text>
                <Text className={cnBonuseBanner('Header-Description')}>{description} </Text>
                <div className={cnBonuseBanner('Header-CountAndTime')}>
                    <div className={cnBonuseBanner('Header-CountAndTime-Count')}>
                        
                    </div>
                    <div className={cnBonuseBanner('Header-Expires')}>
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
            <div className={cnBonuseBanner('Main')}>
                <div className={cnBonuseBanner('Main-Rating')}>
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
                <div className={cnBonuseBanner('Main-Rating')}>
                    <Icon type="diceWhite" />
                    <Text color="white">
                        Набрано <Text color="green">{amount}</Text> рефералов
                    </Text>
                </div>
            </div>
            <div className={cnBonuseBanner('Table')}>
                <BonuseTableReferal
                    items={
                        users?.map((user, index) => ({
                            id: index + 1,
                            avatar: user.avatar,
                            winner: user.username,
                            referrals: user.amount,
                            percent: user.prize,
                        })) || []
                    }
                />
            </div>
        </div>
    );
};

export default BonuseBannerReferal;
