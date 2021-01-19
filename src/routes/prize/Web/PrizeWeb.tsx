import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Prize.scss';
import { cn } from '../../../utils/bem-css-module';
import { PrizeTab } from './PrizeTab';
import { PrizeInfo, TabNameType } from '../PrizeInfo/PrizeInfo';

const cnPrize = cn(s, 'Prize');

const PrizeWeb: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<TabNameType>('freeCoins');
    useStyles(s);

    return (
        <div className={cnPrize()}>
            <div className={cnPrize('Nav')}>
                <PrizeTab
                    tabName="freeCoins"
                    img=""
                    title="Бесплатные монеты"
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                >
                    Вступай в нашу группу и получай до 0.10 монет каждые 15 минут.
                </PrizeTab>

                <PrizeTab
                    tabName="activePromoCode"
                    img=""
                    title="Активировать промокод"
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                >
                    Получайте промокоды от нас или друзей и получайте награду.
                </PrizeTab>

                <PrizeTab
                    tabName="createPromoCode"
                    img=""
                    title="Создать промокод"
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                >
                    Создайте промокод и поделитесь им с друзьями.
                </PrizeTab>
            </div>

            <PrizeInfo selectedTab={selectedTab} />
        </div>
    );
};

export default PrizeWeb;
