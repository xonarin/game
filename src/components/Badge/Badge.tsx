import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Badge.scss';
import { cn } from '../../utils/bem-css-module';
import { hexToRGB } from '../../utils/color';
import Text, { TextProps } from '../Text/Text';

type BadgeColor = 'yellow' | 'pink' | 'red' | 'blue' | 'aqua' | 'green' | 'silver' | 'bronze' | 'gold';

export interface BadgeProps {
    color?: BadgeColor;
    rawColor?: string;

    className?: string;
    children: TextProps['children'];
}

const cnBadge = cn(s, 'Badge');

const Badge: React.FC<BadgeProps> = ({ color, rawColor, className, children }) => {
    useStyles(s);

    return (
        <div className={cnBadge({ color }, [className])}>
            <div
                className={cnBadge('Back')}
                style={
                    rawColor
                        ? { borderColor: rawColor, backgroundColor: `rgba(${hexToRGB(rawColor)}, 0.3)` }
                        : undefined
                }
            />
            <Text className={cnBadge('Value')} size="m" style={rawColor ? { color: rawColor } : undefined}>
                {children}
            </Text>
        </div>
    );
};

export default Badge;
