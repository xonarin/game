import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './HitsItem.scss';
import { cn } from '../../../../../../utils/bem-css-module';
import Text from '../../../../../../components/Text/Text';

export interface HitsItemProps {
    coef: number;
    hit: number;
    isCurrent?: boolean;
}

const cnHitsItem = cn(s, 'HitsItem');

const HitsItem: React.FC<HitsItemProps> = ({ coef, hit, isCurrent }) => {
    useStyles(s);

    let transformedCoef;
    if (coef >= 1000000) {
        transformedCoef = `${Number((coef / 1000000).toFixed(2))}M`;
    } else if (coef >= 1000) {
        transformedCoef = `${Number((coef / 1000).toFixed(2))}K`;
    } else {
        transformedCoef = Number(coef.toFixed(2));
    }

    return (
        <div className={cnHitsItem({ isCurrent })}>
            <Text className={cnHitsItem('Coef')} size="m">
                x{transformedCoef}
            </Text>
            <Text className={cnHitsItem('Hit')} size="xs" weight="regular">
                {hit} hit
            </Text>
        </div>
    );
};

export default HitsItem;
