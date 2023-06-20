import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Bonuse from './Bonuse';

const action = ({ user, chats }: AppContextTypes): RouteResult => {
    const chatId = chats.game;

    return {
        title: 'Турниры',
        chunks: ['bonuse'],
        pageContent: <Bonuse chatId={chatId} />,
        redirect: user ? undefined : '/',
    };
};

export default action;
