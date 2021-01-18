import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './HitsItem.scss';
import { cn } from '../../../../../../utils/bem-css-module';
import Text from '../../../../../../components/Text/Text';
import { cutNumberForHuman } from '../../../../../../utils/strings';

export interface HitsItemProps {
    coef: number;
    hit: number;
    isCurrent?: boolean;
}

const cnHitsItem = cn(s, 'HitsItem');

const HitsItem: React.FC<HitsItemProps> = ({ coef, hit, isCurrent }) => {
    useStyles(s);

    const transformedCoef = cutNumberForHuman(coef);

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
