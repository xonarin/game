import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './LayoutMobileGamenoTabs.scss';
import { cn } from '../../../../utils/bem-css-module';
import Layout from '../../Layout';
import MiddleGame from '../../Web/MiddleGame/MiddleGame';

export interface LayoutMobileProps {
    title: string;
    bottomContent: React.ReactNode;
    historyContent: React.ReactNode;
    Content: React.ReactNode;
}

const cnLayoutMobile = cn(s, 'LayoutMobile');

const LayoutMobile: React.FC<LayoutMobileProps> = ({ title, Content, bottomContent }) => {
    useStyles(s);

    return (
        <Layout>
            <div className={cnLayoutMobile('Container')}>
                <MiddleGame className={cnLayoutMobile('Game')} title={title}>
                    {Content}
                </MiddleGame>
                <div className={cnLayoutMobile('Bets')}>{bottomContent}</div>
            </div>
        </Layout>
    );
};

export default LayoutMobile;
