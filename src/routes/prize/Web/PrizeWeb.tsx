import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Prize.scss';
import { cn } from '../../../utils/bem-css-module';
import { PrizeTab } from './PrizeTab';
import { PrizeInfo, TabNameType } from '../PrizeInfo/PrizeInfo';
import GiftBox from '../bonusicon/giftbox.svg';
import PomoCode from '../bonusicon/promo.svg';
import NewPromoCode from '../bonusicon/add.svg';

const cnPrize = cn(s, 'Prize');

const PrizeWeb: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<TabNameType>('freeCoins');
    useStyles(s);

    return (
        <div className={cnPrize()}>
            <div className={cnPrize('Nav')}>
                <PrizeTab
                    tabName="freeCoins"
                    img={GiftBox}
                    title="Бесплатные монеты"
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                >
                    Вступай в нашу группу и получай до 3 рублей каждый день
                </PrizeTab>

                <PrizeTab
                    tabName="activePromoCode"
                    img={PomoCode}
                    title="Активировать промокод"
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                >
                    Получайте промокоды от нас или друзей и получайте награду
                </PrizeTab>

                <PrizeTab
                    tabName="createPromoCode"
                    img={NewPromoCode}
                    title="Создать промокод"
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                >
                    Создайте промокод и поделитесь им с друзьями
                </PrizeTab>
            </div>

            <PrizeInfo selectedTab={selectedTab} />
        </div>
    );
};

export default PrizeWeb;
