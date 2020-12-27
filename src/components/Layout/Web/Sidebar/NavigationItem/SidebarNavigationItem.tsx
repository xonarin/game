import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './SidebarNavigationItem.scss';
import { cn } from '../../../../../utils/bem-css-module';
import Link, { LinkProps } from '../../../../Link/Link';
import Icon, { IconProps } from '../../../../Icon/Icon';
import useIsOnPath from '../../../../../hooks/useIsOnPath';

export interface SidebarNavigationItemProps {
    to: LinkProps['to'];
    icon: IconProps['type'];
    iconHover: IconProps['hover'];
}

const cnSidebarNavigationItem = cn(s, 'SidebarNavigationItem');

const SidebarNavigationItem: React.FC<SidebarNavigationItemProps> = ({ to, icon, iconHover }) => {
    useStyles(s);

    const active = useIsOnPath(to);

    return (
        <Link className={cnSidebarNavigationItem({ active })} to={to}>
            <Icon className={cnSidebarNavigationItem('Icon')} type={icon} hover={iconHover} size="m" />
        </Link>
    );
};

export default SidebarNavigationItem;
