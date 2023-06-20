import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './LayoutBonuse.scss';
import { cn } from '../../../../utils/bem-css-module';
import Layout from '../../Layout';
import Chat from '../../../Chat/Chat';
import BlockWithTitle from '../BlockWithTitle/BlockWithTitle';

export interface LayoutBonuseProps {
    chatId: string;
    title: string;
    TopContent: React.ReactNode;
}

const cnLayoutBonuse = cn(s, 'LayoutBonuse');

const LayoutBonuse: React.FC<LayoutBonuseProps> = ({ chatId, title, TopContent }) => {
    useStyles(s);

    return (
        <Layout>

            <div className={cnLayoutBonuse('Top')}>
                <div className={cnLayoutBonuse('RightContent')}>
                    <BlockWithTitle title={title}></BlockWithTitle>
                    <div className={cnLayoutBonuse('dayBonus')}>
                        {TopContent}
                    </div>
                </div>
                <Chat className={cnLayoutBonuse('Chat')} chatId={chatId} />
            </div>
        </Layout>
    );
};

export default LayoutBonuse;
