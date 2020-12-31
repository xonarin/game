import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Layout33Content.scss';
import { cn } from '../../../../utils/bem-css-module';
import Layout from '../../Layout';
import CenterPage from '../../Mobile/CenterPage/CenterPage';

export interface Layout33ContentProps {
    centerContent: React.ReactNode;
}

const cnLayout33Content = cn(s, 'Layout33Content');

const Layout33Content: React.FC<Layout33ContentProps> = ({ centerContent }) => {
    useStyles(s);

    return (
        <Layout>
            <div className={cnLayout33Content('Top')}>
                <CenterPage className={cnLayout33Content('RightContent')}>{centerContent}</CenterPage>
            </div>
        </Layout>
    );
};

export default Layout33Content;
