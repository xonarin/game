import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Faq from './Faq';

const action = ({ user }: AppContextTypes): RouteResult => {
    // if (!chatId) {
    //     throw new Error('Chat for classic is not defined');
    // }

    return {
        title: 'Faq',
        chunks: ['classic'],
        pageContent: <Faq />,
        redirect: user ? undefined : '/',
    };
};

export default action;
