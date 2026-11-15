import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './CoinsUPG.scss';
import { cn } from '../../../../utils/bem-css-module';
import { formatCoins } from '../../format';

export interface CoinsUPGProps {
    amount: number;
    size?: 's' | 'm' | 'l';
    className?: string;
}

const cnCoins = cn(s, 'CoinsUPG');

/** Сумма в монетах с иконкой монеты. */
const CoinsUPG: React.FC<CoinsUPGProps> = ({ amount, size = 'm', className }) => {
    useStyles(s);

    return (
        <span className={cnCoins({ size }, [className])}>
            {formatCoins(amount)}
            <i className={cnCoins('Icon')} />
        </span>
    );
};

export default CoinsUPG;
