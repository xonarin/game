import React from 'react';
import { QueryParams } from 'universal-router';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Messages from './Messages';

const action = ({ user, query }: AppContextTypes, params: QueryParams): RouteResult => {
    const chatId = Array.isArray(params.chatId) ? params.chatId[0] : params.chatId;
    const userId = query && (Array.isArray(query.userId) ? query.userId[0] : query.userId);
    return {
        title: 'Messages page',
        chunks: ['messages'],
        pageContent: <Messages chatId={chatId} userId={userId} />,
        redirect: user ? undefined : '/',
    };
};

export default action;
