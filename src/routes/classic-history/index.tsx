import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import ClassicHistory from './ClassicHistory';

const action = ({ user, chats }: AppContextTypes): RouteResult => {
    const chatId = chats.game;

    // if (!chatId) {
    //     throw new Error('Chat for classic is not defined');
    // }

    return {
        title: 'Classic history',
        chunks: ['classic-history'],
        pageContent: <ClassicHistory chatId={chatId} />,
        redirect: user ? undefined : '/',
    };
};

export default action;
