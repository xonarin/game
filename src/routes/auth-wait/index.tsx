import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import AuthWait from './AuthWait';

const action = ({ user }: AppContextTypes): RouteResult => {
    // if (!chatId) {
    //     throw new Error('Chat for classic is not defined');
    // }

    return {
        title: 'Авторизация',
        chunks: ['auth-wait'],
        pageContent: <AuthWait />,
        redirect: user && '/all-games',
    };
};

export default action;
