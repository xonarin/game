import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Faq from './Faq';

const action = ({ user, chats }: AppContextTypes): RouteResult => {
    const chatId = chats.game;

    // if (!chatId) {
    //     throw new Error('Chat for classic is not defined');
    // }

    return {
        title: 'Помощь',
        chunks: ['faq'],
        pageContent: <Faq chatId={chatId} />,
        redirect: user ? undefined : '/login',
    };
};

export default action;
