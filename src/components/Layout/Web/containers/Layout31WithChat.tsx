import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Layout31WithChat.scss';
import { cn } from '../../../../utils/bem-css-module';
import Layout from '../../Layout';
import Chat from '../../../Chat/Chat';
import MiddleGame from '../MiddleGame/MiddleGame';

export interface Layout31WithChatProps {
    chatId: string;
    title: string;
    leftContent: React.ReactNode;
    rightContent: React.ReactNode;
    bottomContent: React.ReactNode;
}

const cnLayout31WithChat = cn(s, 'Layout31WithChat');

const Layout31WithChat: React.FC<Layout31WithChatProps> = ({
    chatId,
    title,
    leftContent,
    rightContent,
    bottomContent,
}) => {
    useStyles(s);

    return (
        <Layout>
            <div className={cnLayout31WithChat('Top')}>
                <div className={cnLayout31WithChat('LeftContent')}>{leftContent}</div>
                <MiddleGame className={cnLayout31WithChat('RightContent')} title={title}>
                    {rightContent}
                </MiddleGame>
                <Chat className={cnLayout31WithChat('Chat')} chatId={chatId} />
            </div>
            <div>{bottomContent}</div>
        </Layout>
    );
};

export default Layout31WithChat;
