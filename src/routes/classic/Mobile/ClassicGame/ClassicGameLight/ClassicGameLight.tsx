import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ClassicGameLight.scss';
import { cn } from '../../../../../utils/bem-css-module';

export interface ClassicGameLightProps {}

const cnClassicGameLight = cn(s, 'ClassicGameLight');

const ClassicGameLight: React.FC<ClassicGameLightProps> = () => {
    useStyles(s);

    return <div className={cnClassicGameLight()} />;
};

export default ClassicGameLight;
