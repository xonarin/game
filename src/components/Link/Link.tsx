import React, { MouseEvent as ReactMouseEvent } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Link.scss';
import history from '../../history';
import { isLeftClickEvent, isModifiedEvent } from '../../utils/link';
import { cn } from '../../utils/bem-css-module';
import useIsOnPath from '../../hooks/useIsOnPath';

export interface LinkProps {
    to?: string;
    isSoft?: boolean;
    external?: boolean;
    newTab?: boolean;
    onClick?: Function;
    render?: (isActive: boolean) => React.ReactNode;

    className?: string;
}

const cnLink = cn(s, 'Link');

const Link: React.FC<LinkProps> = ({
    to,
    isSoft,
    external,
    newTab,
    onClick,
    render,
    children,
    className,
    ...restProps
}) => {
    useStyles(s);

    const onLinkClick = (event: ReactMouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (onClick) {
            onClick(event);
        }

        if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
            return;
        }

        if (event.defaultPrevented) {
            return;
        }

        event.preventDefault();
        history.push(to);
    };

    const isActive = useIsOnPath(to, isSoft);

    return (
        <a
            className={cnLink(null, [className])}
            href={to}
            target={newTab ? '_blank' : undefined}
            onClick={external || newTab ? undefined : onLinkClick}
            {...restProps}
        >
            {render ? render(isActive) : children}
        </a>
    );
};

export default Link;
