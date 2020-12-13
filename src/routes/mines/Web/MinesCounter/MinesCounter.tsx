import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './MinesCounter.scss';
import { cn } from '../../../../utils/bem-css-module';
import Icon from '../../../../components/Icon/Icon';
import Text from '../../../../components/Text/Text';

export type MinesCounterType = 'gem' | 'bomb';

export interface MinesCounterProps {
    type: MinesCounterType;
    counter: number;
}

const cnMinesCounter = cn(s, 'MinesCounter');

const MinesCounter: React.FC<MinesCounterProps> = ({ type, counter }) => {
    useStyles(s);

    return (
        <div className={cnMinesCounter()}>
            <Icon className={cnMinesCounter('Icon')} type={type === 'bomb' ? 'bombColored' : 'gem'} />
            <Text color="white">{counter}</Text>
        </div>
    );
};

export default MinesCounter;
