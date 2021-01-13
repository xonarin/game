import React, { useState } from 'react';

import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';
import PrizeMobile from './Mobile/PrizeMobile';
import PrizeWeb from './Web/PrizeWeb';

export interface AllGamesProps {
    title: string;
    chatId: string;
}

const AllGames: React.FC<AllGamesProps> = ({ title, chatId }) => {
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

    if (mobile) {
        return <PrizeMobile chatId={chatId} />;
    }
    return <PrizeWeb chatId={chatId} />;
};

export default AllGames;
