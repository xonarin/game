import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../utils/bem-css-module';
import s from './PreLoader.scss';

const cnPreLoader = cn(s, 'PreLoader');

const PreLoader: React.FC = () => {
    useStyles(s);

    return (
        <div className={cnPreLoader()}>
            <div className={cnPreLoader('circle')}></div>
        </div>
    );
};

export default PreLoader;
