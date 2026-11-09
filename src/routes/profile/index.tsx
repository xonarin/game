import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Profile from './Profile';

const action = ({ user, chats }: AppContextTypes): RouteResult => {
    const chatId = chats.game;

    return {
        title: 'Профиль',
        chunks: ['profile'],
        pageContent: <Profile chatId={chatId} />,
        redirect: user ? undefined : '/login',
    };
};

export default action;
