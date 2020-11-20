import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './AllGames.scss';
import Panel from '../../components/Panel/Panel';
import Text from '../../components/Text/Text';
import Link from '../../components/Link/Link';
import { cn } from '../../utils/bem-css-module';
import Layout32ContentWithChat from '../../components/Layout/containers/Layout32ContentWithChat';

export interface ClassicProps {
    chatId: string;
}

const cnAllGames = cn(s, 'AllGames');

const AllGames: React.FC<ClassicProps> = ({ chatId }) => {
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
                </div>
            }
            bottomContent={
                <Panel
                    leftHead={
                        <Text className={cnAllGames('HistoryTitle')} font="Rubik" size="l" color="white" upper>
                            Последние игры
                        </Text>
                    }
                />
            }
        />
    );
};

export default AllGames;
