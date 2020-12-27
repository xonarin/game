import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Mines from './Mines';

const action = ({ user, chats }: AppContextTypes): RouteResult => {
    const chatId = chats.game;

    // if (!chatId) {
    //     throw new Error('Chat for mines is not defined');
    // }

    return {
        title: 'Mines page',
        chunks: ['mines'],
        pageContent: <Mines chatId={chatId} />,
        redirect: user ? undefined : '/',
    };
};

export default action;
