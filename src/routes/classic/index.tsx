import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Classic from './Classic';

const action = ({ user, chats }: AppContextTypes): RouteResult => {
    const chatId = chats.game;

    // if (!chatId) {
    //     throw new Error('Chat for classic is not defined');
    // }

    return {
        title: 'Classic game',
        chunks: ['classic'],
        pageContent: <Classic chatId={chatId} />,
        redirect: user ? undefined : '/',
    };
};

export default action;
