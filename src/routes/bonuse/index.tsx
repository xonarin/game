import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Bonuse from './Bonuse';

const action = ({ user }: AppContextTypes): RouteResult => {
    // if (!chatId) {
    //     throw new Error('Chat for classic is not defined');
    // }

    return {
        title: 'Турниры',
        chunks: ['bonuse'],
        pageContent: <Bonuse />,
        redirect: user ? undefined : '/',
    };
};

export default action;
