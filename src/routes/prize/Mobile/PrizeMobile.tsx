import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './PrizeMobile.scss';
import { cn } from '../../../utils/bem-css-module';
import Layout33Content from '../../../components/Layout/Mobile/containers/Layout33Content';
import { PrizeInfo, TabNameType } from '../PrizeInfo/PrizeInfo';
import { PrizeTabMobile } from './PrizeTabMobile';
import GiftBox from '../bonusicon/giftbox.svg';
import PomoCode from '../bonusicon/promo.svg';
import NewPromoCode from '../bonusicon/add.svg';

const cnPrizeMobile = cn(s, 'PrizeMobile');

const PrizeMobile: React.FC = () => {
    useStyles(s);

    const [selectedTab, setSelectedTab] = useState<TabNameType>('freeCoins');

    return (
        <Layout33Content
            centerContent={
            <div className={cnPrizeMobile()}>
                <div className={cnPrizeMobile('Nav')}>
                    <PrizeTabMobile
                        tabName="freeCoins"
                        img={GiftBox}
                        title="Бесплатные монеты"
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                    >
                        Вступай в нашу группу и получай до 3 рублей каждый день
                    </PrizeTabMobile>

                    <PrizeTabMobile
                        tabName="activePromoCode"
                        img={PomoCode}
                        title="Активировать промокод"
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                    >
                        Получайте промокоды от нас или друзей и получайте награду
                    </PrizeTabMobile>

                    <PrizeTabMobile
                        tabName="createPromoCode"
                        img={NewPromoCode}
                        title="Создать промокод"
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                    >
                        Создайте промокод и поделитесь им с друзьями
                    </PrizeTabMobile>
                </div>

                <PrizeInfo selectedTab={selectedTab} />
            </div>
        }
        />
    );
};

export default PrizeMobile;
