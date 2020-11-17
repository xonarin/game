import React from 'react';
import { Link as ScrollLink } from 'react-scroll';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './NavigationItem.scss';
import { cn } from '../../../../utils/bem-css-module';
import Text, { TextProps } from '../../../../components/Text/Text';
import Icon, { IconProps } from '../../../../components/Icon/Icon';

interface NavigationItemProps {
    to: string;
    text: TextProps['children'];
    icon: IconProps['type'];
    iconHover: IconProps['hover'];
}

const cnNavigationItem = cn(s, 'NavigationItem');

const NavigationItem: React.FC<NavigationItemProps> = ({ to, text, icon, iconHover }) => {
    useStyles(s);

    return (
        <ScrollLink className={cnNavigationItem()} to={to} offset={-50} smooth duration={500}>
            <Icon className={cnNavigationItem('Icon')} type={icon} hover={iconHover} />
            <Text className={cnNavigationItem('Text')}>{text}</Text>
        </ScrollLink>
    );
};

export default NavigationItem;
