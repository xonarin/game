import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './PrizeMobile.scss';
import { cn } from '../../../utils/bem-css-module';
import Layout from '../../../components/Layout/Layout';
import { PrizeInfo, TabNameType } from '../PrizeInfo/PrizeInfo';
import { PrizeTabMobile } from './PrizeTabMobile';

const cnPrizeMobile = cn(s, 'PrizeMobile');

const PrizeMobile: React.FC = () => {
    useStyles(s);

    const [selectedTab, setSelectedTab] = useState<TabNameType>('freeCoins');

    return (
        <Layout>
            <div className={cnPrizeMobile()}>
                <div className={cnPrizeMobile('Nav')}>
                    <PrizeTabMobile
                        tabName="freeCoins"
                        img=""
                        title="Бесплатные монеты"
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                    >
                        Вступай в нашу группу и получай до 0.10 монет каждые 15 минут
                    </PrizeTabMobile>

                    <PrizeTabMobile
                        tabName="activePromoCode"
                        img=""
                        title="Активировать промокод"
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                    >
                        Получайте промокоды от нас или друзей и получайте награду
                    </PrizeTabMobile>

                    <PrizeTabMobile
                        tabName="createPromoCode"
                        img=""
                        title="Создать промокод"
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                    >
                        Создайте промокод и поделитесь им с друзьями
                    </PrizeTabMobile>
                </div>

                <PrizeInfo selectedTab={selectedTab} />
            </div>
        </Layout>
    );
};

export default PrizeMobile;
