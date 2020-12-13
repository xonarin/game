import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './AllGames.scss';
import Panel from '../../components/Panel/Panel';
import Text from '../../components/Text/Text';
import Link from '../../components/Link/Link';
import LiveFeedTable from '../../components/LiveFeedTable/LiveFeedTable';
import { cn } from '../../utils/bem-css-module';
import Layout32ContentWithChat from '../../components/Layout/containers/Layout32ContentWithChat';


export interface AllGamesProps {
    chatId: string;
}

const cnAllGames = cn(s, 'AllGames');

const items = [
    { id: 1, game: 'battle' as const, winner: 'Donald', chance: 36, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 2, game: 'dice' as const, winner: 'Donald', chance: 67, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 3, game: 'knb' as const, winner: 'Donald', chance: 10, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 4, game: 'dice' as const, winner: 'Donald', chance: 83, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 5, game: 'knb' as const, winner: 'Donald', chance: 67, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 6, game: 'battle' as const, winner: 'Donald', chance: 36, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
];

const AllGames: React.FC<AllGamesProps> = ({ chatId }) => {
   
    useStyles(s);

    return (
        <Layout32ContentWithChat
            chatId={chatId}
            title="All Games"
            centerContent={
                <div className={cnAllGames('Row')}>
                    <div className={cnAllGames('Game')}>
                        <Link to="/classic">
                            <img src="/wheel.45b409c3.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Classic</h2>
                        </Link>
                    </div>

                    <div className={cnAllGames('Game')}>
                        <Link to="/mines">
                            <img src="/mines.185b60b6.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Mines</h2>
                        </Link>

                    </div>
                    <div className={cnAllGames('Game')}>
                        <Link to="/classic">
                            <img src="/wheel.45b409c3.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Classic</h2>
                        </Link>
                    </div>
                    <div className={cnAllGames('Game')}>
                        <Link to="/mines">
                            <img src="/mines.185b60b6.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Mines</h2>
                        </Link>
                    </div>
                    <div className={cnAllGames('Game')}>
                        <Link to="/classic">
                            <img src="/wheel.45b409c3.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Classic</h2>
                        </Link>
                    </div>
                    <div className={cnAllGames('Game')}>
                        <Link to="/mines">
                            <img src="/mines.185b60b6.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Mines</h2>
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
                    <LiveFeedTable items={items} />
                </Panel>
            }
        />
    );
};

export default AllGames;
