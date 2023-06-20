import React from 'react';

import { AppContextTypes } from '../../../context';
import { RouteResult } from '../../../router';
import AllGamesMobile from './AllGames';

const action = ({ user }: AppContextTypes): RouteResult => {
    // if (!chatId) {
    //     throw new Error('Chat for classic is not defined');
    // }

    return {
        title: 'Все игры',
        chunks: ['classic'],
        pageContent: <AllGamesMobile />,
        redirect: user ? undefined : '/',
    };
};

export default action;
