import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './AllGames.scss';
import Panel from '../../components/Panel/Panel';
import Text from '../../components/Text/Text';
import Link from '../../components/Link/Link';
import LiveFeedTable from '../../components/LiveFeedTable/Web/LiveFeedTable';
import { cn } from '../../utils/bem-css-module';
import Layout32ContentWithChat from '../../components/Layout/Web/containers/Layout32ContentWithChat';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';
import AllGamesMobile from './Mobile/AllGames';

export interface AllGamesProps {
    title: string;
    chatId: string;
}

const cnAllGames = cn(s, 'AllGames');

const AllGames: React.FC<AllGamesProps> = ({ chatId }) => {
    const [mobile, setMobile] = useState(false);
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

    useStyles(s);

    if (mobile) {
        return <AllGamesMobile />;
    }
    return (
        <Layout32ContentWithChat
            chatId={chatId}
            title="All Games"
            centerContent={
                <div className={cnAllGames('Row')}>
                    <div className={cnAllGames('Game')}>
                        <Link to="/classic">
                            <img src="/classicback.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Classic</h2>
                        </Link>
                    </div>

                    <div className={cnAllGames('Game')}>
                        <Link to="/mines">
                            <img src="/minesback.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Mines</h2>
                        </Link>
                    </div>
                    <div className={cnAllGames('Game')}>
                        <Link to="#">
                            <img src="/darts.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Darts</h2>
                        </Link>
                    </div>
                    <div className={cnAllGames('Game')}>
                        <Link to="#">
                            <img src="/knb.png" alt="" />
                            <h2 className={cnAllGames('Title')}>KNB</h2>
                        </Link>
                    </div>
                </div>
            }
            bottomContent={
                <Panel
                    leftHead={
                        <Text className={cnAllGames('HistoryTitle')} font="Rubik" size="l" color="white" upper>
                            Последние игры
                        </Text>
                    }
                >
                    <LiveFeedTable />
                </Panel>
            }
        />
    );
};

export default AllGames;
