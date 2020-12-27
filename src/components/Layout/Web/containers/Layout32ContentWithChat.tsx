import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Layout32ContentWithChat.scss';
import { cn } from '../../../../utils/bem-css-module';
import Layout from '../../Layout';
import Chat from '../../../Chat/Chat';
import MiddleGame from '../MiddleGame/MiddleGame';

export interface Layout32ContentWithChatProps {
    chatId: string;
    title: string;
    centerContent: React.ReactNode;
    bottomContent: React.ReactNode;
}

const cnLayout32ContentWithChat = cn(s, 'Layout32ContentWithChat');

const Layout32ContentWithChat: React.FC<Layout32ContentWithChatProps> = ({ chatId, centerContent, bottomContent }) => {
    useStyles(s);

    return (
        <Layout>
            <div className={cnLayout32ContentWithChat('Top')}>
                <MiddleGame className={cnLayout32ContentWithChat('RightContent')}>{centerContent}</MiddleGame>
                <Chat className={cnLayout32ContentWithChat('Chat')} chatId={chatId} />
            </div>
            <div>{bottomContent}</div>
        </Layout>
    );
};

export default Layout32ContentWithChat;
