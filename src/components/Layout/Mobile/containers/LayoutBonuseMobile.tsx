import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './LayoutBonuseMobile.scss';
import { cn } from '../../../../utils/bem-css-module';
import Layout from '../../Layout';
import BlockWithTitle from '../BlockWithTitle/BlockWithTitle';

export interface LayoutBonuseProps {
    title: string;
    TopContent: React.ReactNode;
    Navigation: React.ReactNode;

}

const cnLayoutBonuseMobile = cn(s, 'LayoutBonuseMobile');

const LayoutBonuse: React.FC<LayoutBonuseProps> = ({ title, TopContent, Navigation  }) => {
    useStyles(s);

    return (
        <Layout>
            <div className={cnLayoutBonuseMobile('Navigation')}>{Navigation}</div>
            <BlockWithTitle title={title}>{TopContent}</BlockWithTitle>
        </Layout>
    );
};

export default LayoutBonuse;
