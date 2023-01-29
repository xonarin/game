import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Layout33Content.scss';
import { cn } from '../../../../utils/bem-css-module';
import Layout from '../../Layout';
import Chat from '../../../Chat/Chat';

export interface Layout33ContentProps {
    chatId: string;
    centerContent: React.ReactNode;
    title?: string;
}

const cnLayout33Content = cn(s, 'Layout33Content');

const Layout33Content: React.FC<Layout33ContentProps> = ({ chatId, centerContent }) => {
    useStyles(s);

    return (
        <Layout>
            <div className={cnLayout33Content('Top')}>
                <div className={cnLayout33Content('RightContent')}>{centerContent}</div>
                <Chat className={cnLayout33Content('Chat')} chatId={chatId} />
            </div>
        </Layout>
    );
};

export default Layout33Content;
