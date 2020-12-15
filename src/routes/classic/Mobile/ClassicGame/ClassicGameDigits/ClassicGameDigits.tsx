import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ClassicGameDigits.scss';
import { cn } from '../../../../../utils/bem-css-module';
import { addLeadingZeros } from '../../../../../utils/strings';

export interface ClassicGameDigitsProps {
    seconds: number;
    className?: string;
}

const cnClassicGameDigits = cn(s, 'ClassicGameDigits');

const ClassicGameDigits: React.FC<ClassicGameDigitsProps> = ({ seconds, className }) => {
    useStyles(s);

    const [first, second] = addLeadingZeros(seconds);

    return (
        <div className={cnClassicGameDigits(null, [className])}>
            <div className={cnClassicGameDigits('Digit')}>{first}</div>
            <div className={cnClassicGameDigits('Digit')}>{second}</div>
        </div>
    );
};

export default ClassicGameDigits;
