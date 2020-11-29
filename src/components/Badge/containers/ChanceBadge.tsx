import React from 'react';

import Badge, { BadgeProps } from '../Badge';

export interface ChanceBadgeProps {
    chance: number;
    forceColor?: string;
}

const getColor = (chance: number): BadgeProps['color'] => {
    if (chance < 5) return 'red';
    if (chance < 15) return 'pink';
    if (chance < 40) return 'yellow';
    if (chance < 60) return 'aqua';
    if (chance < 80) return 'green';
    return 'blue';
};

const ChanceBadge: React.FC<ChanceBadgeProps> = ({ chance, forceColor }) => {
    return (
        <Badge color={forceColor ? undefined : getColor(chance)} rawColor={forceColor}>
            {chance}%
        </Badge>
    );
};

export default ChanceBadge;
