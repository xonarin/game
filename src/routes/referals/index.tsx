import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Referals from './Referals';

const action = ({ user, chats }: AppContextTypes): RouteResult => {
    const chatId = chats.game;

    return {
        title: 'Партнёрская программа',
        chunks: ['partners'],
        pageContent: <Referals chatId={chatId} />,
        redirect: user ? undefined : '/login',
    };
};

export default action;
