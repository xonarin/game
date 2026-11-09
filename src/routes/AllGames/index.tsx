import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import AllGames from './AllGames';

const action = ({ chats }: AppContextTypes): RouteResult => {
    const chatId = chats.game;

    // if (!chatId) {
    //     throw new Error('Chat for classic is not defined');
    // }

    return {
        title: 'Все игры',
        chunks: ['casino'],
        pageContent: <AllGames chatId={chatId} />,
    };
};

export default action;
