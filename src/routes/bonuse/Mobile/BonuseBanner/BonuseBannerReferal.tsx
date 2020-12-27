import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './BonuseBanner.scss';
import { cn } from '../../../../utils/bem-css-module';
import Text from '../../../../components/Text/Text';
import TextInBox from '../../../../components/TextInBox/TextInBox';
import Icon from '../../../../components/Icon/Icon';
import BonuseTableReferal from '../BonuseTable/BonuseTableReferal';
import Button from '../../../../components/Button/Button';

export interface BonuseBannerReferalMobileProps {
    title: string;
    description: string | React.ReactNode;
    count: string;
}
const cnBonuseBannerMobile = cn(s, 'BonuseBanner');
const items = [
    { id: 1, winner: 'Donald', referals: 10, percent: 30 },
    { id: 2, winner: 'Donald', referals: 10, percent: 20 },
    { id: 3, winner: 'Donald', referals: 10, percent: 10 },
    { id: 4, winner: 'Donald', referals: 10, percent: 5 },
    { id: 5, winner: 'Donald', referals: 10, percent: 5 },
    { id: 6, winner: 'Donald', referals: 10, percent: 5 },
];
const BonuseBannerReferalMobile: React.FC<BonuseBannerReferalMobileProps> = ({ title, description, count }) => {
    useStyles(s);
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
                    <Text className={cnBonuseBannerMobile('Header-Description')} line='xl' color='white'>{description} </Text>
                    <div className={cnBonuseBannerMobile('Header-Expires')}>
                        <Text size="xs" color="gold">
                            Истекает через:
                        </Text>
                        <Text size="xs" color="white">
                            3 ДНЯ 1 ЧАС 59 МИНУТ
                        </Text>
                    </div>
                </div>
            </div>
            <div className={cnBonuseBannerMobile('Main')}>
                <div className={cnBonuseBannerMobile('Main-Rating')}>
                    <Icon type="diceWhite" />
                    <Text color="white">
                        Вы на <Text color="green">1м</Text> месте
                    </Text>
                </div>
                <div className={cnBonuseBannerMobile('Main-Rating')}>
                    <Icon type="diceWhite" />
                    <Text color="white">
                        Набрано <Text color="green">500</Text> рефералов
                    </Text>
                </div>
            </div>
            <div className={cnBonuseBannerMobile('Table')}>
                <BonuseTableReferal items={items} />
            </div>
        </div>
    );
};

export default BonuseBannerReferalMobile;
