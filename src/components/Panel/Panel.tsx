import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Panel.scss';
import { cn } from '../../utils/bem-css-module';

export interface PanelProps {
    leftHead: React.ReactNode;
    rightHead?: React.ReactNode;
    centerHead?:React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const cnPanel = cn(s, 'Panel');

const Panel: React.FC<PanelProps> = ({ leftHead,centerHead, rightHead, className, children }) => {
    useStyles(s);

    return (
        <div className={cnPanel(null, [className])}>
            <div className={cnPanel('Head')}>
                <div>{leftHead}</div>
                {centerHead && <div>{centerHead}</div>}
                {rightHead && <div>{rightHead}</div>}
            </div>
            <div className={cnPanel('Content')}>{children}</div>
        </div>
    );
};

export default Panel;
