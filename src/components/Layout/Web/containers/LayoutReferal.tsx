import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './LayoutReferal.scss';
import { cn } from '../../../../utils/bem-css-module';
import Layout from '../../Layout';

export interface LayoutReferalProps {
    TopContent: React.ReactNode;
    LeftContent: React.ReactNode;
    RightContent: React.ReactNode;
    BottomContent: React.ReactNode;
    DiagramsIcon: React.ReactNode;
    TableIcons: React.ReactNode;
}

const cnLayoutReferal = cn(s, 'LayoutReferal');

const LayoutReferal: React.FC<LayoutReferalProps> = ({ TopContent, LeftContent, RightContent, BottomContent, DiagramsIcon, TableIcons }) => {
    useStyles(s);

    return (
        <Layout>
            <div className={cnLayoutReferal('Container')}>
                <div className={cnLayoutReferal('Top')}>
                    {TopContent}
                </div>
                <div className={cnLayoutReferal('Icon')}>{DiagramsIcon}</div>
                <div className={cnLayoutReferal('Diagrams')}>
                    <div className={cnLayoutReferal('Diagrams-Left')}>{LeftContent}</div>
                    <div className={cnLayoutReferal('Diagrams-Right')}>{RightContent}</div>
                </div>
                <div className={cnLayoutReferal('Icon')}>{TableIcons}</div>
                <div className={cnLayoutReferal('Bottom')}>{BottomContent}</div>

            </div>
        </Layout>
    );
};

export default LayoutReferal;
