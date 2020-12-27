import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './HitsItemsGroup.scss';
import { cn } from '../../../../../utils/bem-css-module';
import HitsItem, { HitsItemProps } from './HitsItem/HitsItem';

export interface HitsItemsGroupProps {
    items: HitsItemProps[];
}

export const cnHitsItemsGroup = cn(s, 'HitsItemsGroup');

const HitsItemsGroup: React.FC<HitsItemsGroupProps> = ({ items }) => {
    useStyles(s);

    return (
        <div className={cnHitsItemsGroup()}>
            {items.map(item => (
                <HitsItem {...item} key={item.coef} />
            ))}
        </div>
    );
};

export default HitsItemsGroup;
