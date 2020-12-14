import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './MiddleGame.scss';
import { cn } from '../../../../utils/bem-css-module';
import Title from '../../../Title/Title';

export interface MiddleGameProps {
    title?: string;
    className?: string;
    children: React.ReactNode;
}

const cnMiddleGame = cn(s, 'MiddleGame');

const MiddleGame: React.FC<MiddleGameProps> = ({ title, className, children }) => {
    useStyles(s);

    return (
        <div className={cnMiddleGame(null, [className])}>
            {title ? (
                <div className={cnMiddleGame('Head')}>
                    <Title className={cnMiddleGame('Title')} font="Rubik" size="xl" upper>
                        {title}
                    </Title>
                </div>
            ) : null}

            <div className={cnMiddleGame('Content')}>{children}</div>
        </div>
    );
};

export default MiddleGame;
