import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './StatsItem.scss';
import { cn } from '../../../../utils/bem-css-module';
import Icon, { IconProps } from '../../../../components/Icon/Icon';
import Text, { TextProps } from '../../../../components/Text/Text';

export interface StatsItemProps {
    label: TextProps['children'];
    icon: IconProps['type'];
    value: TextProps['children'];

    className?: string;
}

const cnStatsItem = cn(s, 'StatsItem');

const StatsItem: React.FC<StatsItemProps> = ({ label, icon, value, className }) => {
    useStyles(s);

    return (
        <div className={cnStatsItem(null, [className])}>
            <Icon className={cnStatsItem('Icon')} type={icon} size="m" />
            <div className={cnStatsItem('Main')}>
                <Text className={cnStatsItem('Value')} size="xs" color="white">
                    {value}
                </Text>
                <Text className={cnStatsItem('Label')} size="xs">
                    {label}
                </Text>
            </div>
        </div>
    );
};

export default StatsItem;
