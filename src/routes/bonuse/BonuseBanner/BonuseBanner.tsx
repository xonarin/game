import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './BonuseBanner.scss';
import { cn } from '../../../utils/bem-css-module';
import Text from '../../../components/Text/Text';
import TextInBox from '../../../components/TextInBox/TextInBox';
import Icon from '../../../components/Icon/Icon';
import BonuseTable from '../BonuseTable/BonuseTable';

export interface BonuseBannerProps {
    title: string;
    description: string | React.ReactNode;
    count: string;
}
const cnBonuseBanner = cn(s, 'BonuseBanner');
const items = [
    { id: 1, winner: 'Donald', point: 10, fund: 2500 },
    { id: 2, winner: 'Donald', point: 10, fund: 2500 },
    { id: 3, winner: 'Donald', point: 10, fund: 2500 },
    { id: 4, winner: 'Donald', point: 10, fund: 2500 },
    { id: 5, winner: 'Donald', point: 10, fund: 2500 },
    { id: 6, winner: 'Donald', point: 10, fund: 2500 },
];
const BonuseBanner: React.FC<BonuseBannerProps> = ({ title, description, count }) => {
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
                            Expires in:
                        </Text>
                        <Text size="xs" color="white">
                            3 DAYS 1 H 59 MIN
                        </Text>
                    </div>
                </div>
            </div>
            <div className={cnBonuseBanner('Main')}>
                <div className={cnBonuseBanner('Main-Rating')}>
                    <Icon type="diceWhite" />
                    <Text color="white">
                        You are on the <Text color="green">12th</Text> line
                    </Text>
                </div>
                <div className={cnBonuseBanner('Main-Rating')}>
                    <Icon type="diceWhite" />
                    <Text color="white">
                        Scored <Text color="green">500</Text> points
                    </Text>
                </div>
            </div>
            <div className={cnBonuseBanner('Table')}>
                <BonuseTable items={items} />
            </div>
        </div>
    );
};

export default BonuseBanner;
