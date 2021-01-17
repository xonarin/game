import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Layout from '../../components/Layout/Layout';
import { Transaction } from '../../components/Transaction/Transaction';

const action = ({ user, chats }: AppContextTypes): RouteResult => {
    const chatId = chats.game;

    // if (!chatId) {
    //     throw new Error('Chat for classic is not defined');
    // }

    return {
        title: 'Balance',
        chunks: ['balance'],
        pageContent: (
            <Layout>
                <Transaction mobile />
            </Layout>
        ),
        redirect: user ? undefined : '/',
    };
};

export default action;
