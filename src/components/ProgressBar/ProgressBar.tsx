import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ProgressBar.scss';
import { cn } from '../../utils/bem-css-module';

export type ProgressBarTheme = 'default';

export interface ProgressBarProps {
    theme?: ProgressBarTheme;
    percent: number;
    className?: string;
}

const cnProgressBar = cn(s, 'ProgressBar');

const ProgressBar: React.FC<ProgressBarProps> = ({ theme = 'default', percent, className }) => {
    useStyles(s);

    return (
        <div className={cnProgressBar({ theme }, [className])}>
            <div className={cnProgressBar('Bar')} style={{ width: `${percent}%` }} />
        </div>
    );
};

export default ProgressBar;
