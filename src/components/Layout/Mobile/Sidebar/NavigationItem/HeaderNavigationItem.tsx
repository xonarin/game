import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './HeaderNavigationItem.scss';
import { cn } from '../../../../../utils/bem-css-module';
import Text, { TextProps } from '../../../../../components/Text/Text';
import Icon, { IconProps } from '../../../../../components/Icon/Icon';
import Link from '../../../../Link/Link';

interface NavigationItemProps {
    to?: string;
    text?: TextProps['children'];
    icon: IconProps['type'];
    iconHover: IconProps['hover'];
}

const cnHeaderNavigationItem = cn(s, 'HeaderNavigationItem');

const NavigationItem: React.FC<NavigationItemProps> = ({ to, text, icon, iconHover }) => {
    useStyles(s);

    return (
        <Link className={cnHeaderNavigationItem()} to={to}>
            <Icon className={cnHeaderNavigationItem('Icon')} type={icon} hover={iconHover} />
            <Text className={cnHeaderNavigationItem('Text')}>{text}</Text>
        </Link>
    );
};

export default NavigationItem;
