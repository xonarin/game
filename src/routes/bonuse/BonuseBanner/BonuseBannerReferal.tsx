import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './BonuseBanner.scss';
import { cn } from '../../../utils/bem-css-module';
import Text from '../../../components/Text/Text';
import TextInBox from '../../../components/TextInBox/TextInBox';
import Icon from '../../../components/Icon/Icon';
import BonuseTableReferal from '../BonuseTable/BonuseTableReferal';

export interface BonuseBannerReferalProps {
    title: string;
    description: string | React.ReactNode;
    count: string;
}
const cnBonuseBanner = cn(s, 'BonuseBanner');
const items = [
    { id: 1, winner: 'Donald', referals: 10, percent: 30 },
    { id: 2, winner: 'Donald', referals: 10, percent: 20 },
    { id: 3, winner: 'Donald', referals: 10, percent: 10 },
    { id: 4, winner: 'Donald', referals: 10, percent: 5 },
    { id: 5, winner: 'Donald', referals: 10, percent: 5 },
    { id: 6, winner: 'Donald', referals: 10, percent: 5 },
];
const BonuseBannerReferal: React.FC<BonuseBannerReferalProps> = ({ title, description, count }) => {
    useStyles(s);
    return (
        <div className={cnBonuseBanner()}>
            <div className={cnBonuseBanner('Header')}>
                <Text upper color="white" size="xxl" className={cnBonuseBanner('Header-Title')}>
                    {title}
                </Text>
                <Text className={cnBonuseBanner('Header-Description')}>{description} </Text>
                <div className={cnBonuseBanner('Header-CountAndTime')}>
                    <div className={cnBonuseBanner('Header-CountAndTime-Count')}>
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
                    <div className={cnBonuseBanner('Header-Expires')}>
                        <Text size="xs" color="gold">
                            Истекает через:
                        </Text>
                        <Text size="xs" color="white">
                            24 ДНЯ 1 ЧАС 59 МИНУТ
                        </Text>
                    </div>
                </div>
            </div>
            <div className={cnBonuseBanner('Main')}>
                <div className={cnBonuseBanner('Main-Rating')}>
                    <Icon type="diceWhite" />
                    <Text color="white">
                        Вы на <Text color="green">1м</Text> месте
                    </Text>
                </div>
                <div className={cnBonuseBanner('Main-Rating')}>
                    <Icon type="diceWhite" />
                    <Text color="white">
                        Набрано <Text color="green">500</Text> рефералов
                    </Text>
                </div>
            </div>
            <div className={cnBonuseBanner('Table')}>
                <BonuseTableReferal items={items} />
            </div>
        </div>
    );
};

export default BonuseBannerReferal;
