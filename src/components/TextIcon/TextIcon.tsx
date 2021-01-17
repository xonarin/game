import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './TextIcon.scss';
import { cn } from '../../utils/bem-css-module';
import Text, { TextProps } from '../Text/Text';
import Icon, { IconProps } from '../Icon/Icon';

export interface TextIconProps {
    font?: TextProps['font'];
    size?: TextProps['size'];
    line?: TextProps['line'];
    weight?: TextProps['weight'];
    color?: TextProps['color'];
    italic?: TextProps['italic'];
    upper?: TextProps['upper'];
    text: TextProps['children'];
    icon: IconProps['type'];
    iconSize?: IconProps['size'];
    noGap?: boolean;

    className?: string;
}

const cnTextIcon = cn(s, 'TextIcon');

const TextIcon: React.FC<TextIconProps> = ({
    font,
    size,
    line,
    weight,
    color,
    italic,
    upper,
    text,
    icon,
    iconSize = 'xs',
    noGap = false,
    className,
}) => {
    useStyles(s);

    return (
        <span className={cnTextIcon(null, [className])}>
            <Text
                className={cnTextIcon('Text')}
                font={font}
                size={size}
                line={line}
                weight={weight}
                color={color}
                italic={italic}
                upper={upper}
            >
                {text}
            </Text>
            <Icon className={cnTextIcon('Icon', { noGap })} type={icon} size={iconSize} />
        </span>
    );
};

export default TextIcon;
