import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './PeopleCircles.scss';
import { cn } from '../../../../../utils/bem-css-module';

export interface PeopleCirclesProps {
    className?: string;
}

const cnPeopleCircles = cn(s, 'PeopleCircles');

const PeopleCircles: React.FC<PeopleCirclesProps> = ({ className }) => {
    useStyles(s);

    return (
        <div className={cnPeopleCircles(null, [className])}>
            <div />
            <div />
            <div />
        </div>
    );
};

export default PeopleCircles;
