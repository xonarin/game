import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Layout34ContentWithChat.scss';
import { cn } from '../../../../utils/bem-css-module';
import Layout from '../../Layout';
import Chat from '../../../Chat/Chat';
import MiddleGame from '../MiddleGame/MiddleGameBonuse';

export interface Layout34ContentWithChatProps {
    chatId: string;
    title: string;
    centerContent: React.ReactNode;
    bottomContent: React.ReactNode;
}

const cnLayout34ContentWithChat = cn(s, 'Layout34ContentWithChat');

const Layout34ContentWithChat: React.FC<Layout34ContentWithChatProps> = ({ chatId, centerContent, bottomContent }) => {
    useStyles(s);

    return (
        <Layout>
            <div className={cnLayout34ContentWithChat('Top')}>
                <MiddleGame className={cnLayout34ContentWithChat('RightContent')}>{centerContent}</MiddleGame>
                <Chat className={cnLayout34ContentWithChat('Chat')} chatId={chatId} />
            </div>
            <div>{bottomContent}</div>
        </Layout>
    );
};

export default Layout34ContentWithChat;
