import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Login from './Login';

const action = ({ user, query, authProviders }: AppContextTypes): RouteResult => {
    const error = query && typeof query.error === 'string' ? query.error : undefined;

    return {
        title: 'Вход',
        chunks: ['login'],
        pageContent: (
            <Login
                providers={
                    authProviders || {
                        vk: false,
                        google: false,
                        steam: false,
                        telegramBot: null,
                        telegramChannel: null,
                        dev: false,
                        authServiceUrl: null,
                    }
                }
                error={error}
            />
        ),
        redirect: user && '/',
    };
};

export default action;
