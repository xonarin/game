import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './LayoutBonuse.scss';
import { cn } from '../../../../utils/bem-css-module';
import Layout from '../../Layout';
import BlockWithTitle from '../BlockWithTitle/BlockWithTitle';

export interface LayoutBonuseProps {
    title: string;
    TopContent: React.ReactNode;
    LeftContent: React.ReactNode;
    RightContent: React.ReactNode;
}

const cnLayoutBonuse = cn(s, 'LayoutBonuse');

const LayoutBonuse: React.FC<LayoutBonuseProps> = ({ title, TopContent, LeftContent, RightContent }) => {
    useStyles(s);

    return (
        <Layout>
            <BlockWithTitle title={title}>{TopContent}</BlockWithTitle>
            <div className={cnLayoutBonuse('Tables')}>
                <div className={cnLayoutBonuse('Tables-Left')}>{LeftContent}</div>
                <div className={cnLayoutBonuse('Tables-Right')}>{RightContent}</div>
            </div>
        </Layout>
    );
};

export default LayoutBonuse;
