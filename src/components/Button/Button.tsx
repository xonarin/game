import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Button.scss';
import { cn } from '../../utils/bem-css-module';
import Icon, { IconProps } from '../Icon/Icon';

type ButtonShape = 'right' | 'left' | 'alphaRight';
type ButtonColor = 'blue' | 'green' | 'gray' | 'bordered';
type ButtonSize = 'xs' | 's' | 'm';
type ButtonWeight = 'normal' | 'semiBold' | 'bold';

export interface ButtonProps {
    shape?: ButtonShape;
    color?: ButtonColor;
    size?: ButtonSize;
    weight?: ButtonWeight;
    upper?: boolean;
    submit?: boolean;
    icon?: IconProps['type'];
    iconHover?: IconProps['hover'];
    iconSize?: IconProps['size'];
    clear?: boolean;

    onClick?: () => void;

    className?: string;
    children?: React.ReactNode;
}

const cnButton = cn(s, 'Button');

const Button: React.FC<ButtonProps> = ({
    shape = 'right',
    color = 'blue',
    size = 's',
    weight = 'bold',
    upper,
    submit,
    icon,
    iconHover,
    iconSize,
    clear,
    onClick,
    className,
    children,
}) => {
    useStyles(s);

    return (
        <button
            className={cnButton(clear ? { clear: true } : { shape, color, size, weight, upper }, [className])}
            // eslint-disable-next-line react/button-has-type
            type={submit ? 'submit' : 'button'}
            onClick={onClick}
        >
            {icon ? (
                <Icon
                    className={cnButton('Icon', { withHover: Boolean(iconHover) })}
                    type={icon}
                    hover={iconHover}
                    size={iconSize}
                />
            ) : (
                <span className={cnButton('Text')}>{children}</span>
            )}
        </button>
    );
};

export default Button;
