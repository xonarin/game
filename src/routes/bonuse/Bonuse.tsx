import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../utils/bem-css-module';
import LayoutBonuse from '../../components/Layout/Web/containers/LayoutBonuse';
import LayoutBonuseMobile from '../../components/Layout/Mobile/containers/LayoutBonuseMobile';
import Text from '../../components/Text/Text';
import BonuseBannerPlayer from './Web/BonuseBanner/BonuseBannerPlayer';
import BonuseBannerReferal from './Web/BonuseBanner/BonuseBannerReferal';
import MonthlyBonuse from './Web/MonthlyBonuse/MonthlyBonuse';
import MonthlyBonuseMobile from './Mobile/MonthlyBonuse/MonthlyBonuse';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';
import BonuseBannerPlayerMobile from './Mobile/BonuseBanner/BonuseBannerPlayer';
import BonuseBannerReferalMobile from './Mobile/BonuseBanner/BonuseBannerReferal';
import s from './Bonuse.scss';

const cnBonuse = cn(s, 'Bonuse');

const Bonuse: React.FC = () => {
    const [mobile, setMobile] = useState(false);
    const [selectedScreen, setSelectedScreen] = useState('bonuse');
    useStyles(s);
    useIsomorphicLayoutEffect(() => {
        if (
            typeof window !== 'undefined' &&
            typeof window.document !== 'undefined' &&
            typeof window.document.createElement !== 'undefined' &&
            window.screen.width < 992
        ) {
            setMobile(true);
        }
    }, [typeof window !== 'undefined' && window?.screen?.width]);

    if (mobile) {
        return (
            <LayoutBonuseMobile
                title={
                    selectedScreen === 'bonuse'
                        ? 'Big Tour'
                        : selectedScreen === 'player'
                        ? 'АКТИВНЫЙ ИГРОК'
                        : 'БОНУС-ПАРТНЁР'
                }
                TopContent={
                    selectedScreen === 'bonuse' ? (
                        <MonthlyBonuseMobile />
                    ) : selectedScreen === 'player' ? (
                        <BonuseBannerPlayerMobile
                            title="Активный игрок"
                            description={
                                <>
                                    {' '}
                                    Каждую <Text color="white"> неделю </Text> мы разыгрываем призы среди{' '}
                                    <Text color="white"> 3 </Text> самых активных игроков, которые сделали больше всех
                                    ставок по сумме.
                                </>
                            }
                            count="3000"
                        />
                    ) : (
                        <BonuseBannerReferalMobile
                            title="Бонус-партнёр"
                            description={
                                <>
                                    {' '}
                                    Приглашай людей на сайт и каждые <Text color="white"> 30 дней </Text> и лучшие
                                    партнёры по количеству рефералов получат повышенные % отчисления!
                                </>
                            }
                            count="3000"
                        />
                    )
                }
                Navigation={
                    <div className={cnBonuse('Navigation')}>
                        <button type="button" onClick={() => setSelectedScreen('player')}>
                            <Text color={selectedScreen === 'player' ? 'white' : undefined}>АКТИВНЫЙ ИГРОК</Text>
                        </button>
                        <button type="button" onClick={() => setSelectedScreen('bonuse')}>
                            <Text color={selectedScreen === 'bonuse' ? 'white' : undefined}>Big Tour</Text>
                        </button>
                        <button type="button" onClick={() => setSelectedScreen('referal')}>
                            <Text color={selectedScreen === 'referal' ? 'white' : undefined}>БОНУС-ПАРТНЁР</Text>
                        </button>
                    </div>
                }
            />
        );
    }
    return (
        <LayoutBonuse
            title="Турниры"
            TopContent={<MonthlyBonuse />}
            LeftContent={
                <BonuseBannerPlayer
                    title="Активный игрок"
                    description={
                        <>
                            {' '}
                            Каждую <Text color="white"> неделю </Text> мы разыгрываем призы среди{' '}
                            <Text color="white"> 3 </Text> самых активных игроков, которые сделали больше всех ставок по
                            сумме.
                        </>
                    }
                    count="3000"
                />
            }
            RightContent={
                <BonuseBannerReferal
                    title="Бонус-партнёр"
                    description={
                        <>
                            {' '}
                            Приглашай людей на сайт и каждые <Text color="white"> 30 дней </Text> и лучшие партнёры по
                            количеству рефералов получат повышенные % отчисления!
                        </>
                    }
                    count="3000"
                />
            }
        />
    );
};

export default Bonuse;
