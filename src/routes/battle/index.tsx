import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Layout31WithChat from '../../components/Layout/Web/containers/Layout31WithChat';

const action = ({ user, chats }: AppContextTypes): RouteResult => {
    const chatId = chats.game;

    return {
        title: 'Battle page',
        chunks: ['battle'],
        pageContent: (
            <Layout31WithChat
                chatId={chatId}
                title="Battle"
                leftContent="Battle page"
                rightContent="Right"
                bottomContent="Bottom"
            />
        ),
        redirect: user ? undefined : '/',
    };
};

export default action;
