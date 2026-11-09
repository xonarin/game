import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './AllGames.scss';
import Link from '../../components/Link/Link';
import { cn } from '../../utils/bem-css-module';
import Layout32ContentWithChat from '../../components/Layout/Web/containers/Layout32ContentWithChat';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';
import AllGamesMobile from './Mobile/AllGames';

export interface AllGamesProps {
    title?: string;
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
            title="Lobby"
            centerContent={
                <div className={cnAllGames('Row')}>
                    <div className={cnAllGames('Game')}>
                        <Link to="/mines">
                            <img src="/minesback.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Mines</h2>
                        </Link>
                    </div>
                </div>
            }
        />
    );
};

export default AllGames;
