import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './LayoutProfile.scss';
import { cn } from '../../../../utils/bem-css-module';
import Layout from '../../Layout';
import Chat from '../../../Chat/Chat';
import MiddleGame from '../MiddleGame/MiddleGame';

export interface LayoutProfileProps {
    chatId: string;
    title: string;
    centerContent: React.ReactNode;
}

const cnLayoutProfile = cn(s, 'LayoutProfile');

const LayoutProfile: React.FC<LayoutProfileProps> = ({ chatId, centerContent }) => {
    useStyles(s);

    return (
        <Layout>
            <div className={cnLayoutProfile('Top')}>
                <MiddleGame className={cnLayoutProfile('RightContent')}>{centerContent}</MiddleGame>
                <Chat className={cnLayoutProfile('Chat')} chatId={chatId} />
            </div>
        </Layout>
    );
};

export default LayoutProfile;
