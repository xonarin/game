import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './LayoutReferalMobile.scss';
import { cn } from '../../../../utils/bem-css-module';
import Layout from '../../Layout';

export interface LayoutReferalMobileProps {
    TopContent: React.ReactNode;
    FirstDiagram: React.ReactNode;
    SecondDiagram: React.ReactNode;
    ReferalTable: React.ReactNode;
    DiagramsIcon: React.ReactNode;
    TableIcons: React.ReactNode;
}

const cnLayoutReferalMobile = cn(s, 'LayoutReferal');

const LayoutReferalMobile: React.FC<LayoutReferalMobileProps> = ({
    TopContent,
    FirstDiagram,
    SecondDiagram,
    ReferalTable,
    DiagramsIcon,
    TableIcons,
}) => {
    useStyles(s);

    return (
        <Layout>
            <div className={cnLayoutReferalMobile('Container')}>
                <div className={cnLayoutReferalMobile('Top')}>{TopContent}</div>
                <div className={cnLayoutReferalMobile('Icon')}>{DiagramsIcon}</div>
                <div className={cnLayoutReferalMobile('Diagrams-Left')}>{FirstDiagram}</div>
                <div className={cnLayoutReferalMobile('Diagrams-Right')}>{SecondDiagram}</div>
                <div className={cnLayoutReferalMobile('Icon')}>{TableIcons}</div>
                <div className={cnLayoutReferalMobile('Bottom')}>{ReferalTable}</div>
            </div>
        </Layout>
    );
};

export default LayoutReferalMobile;
