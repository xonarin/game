import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../utils/bem-css-module';
import s from './Text.scss';

type TextFont = 'OpenSans' | 'Rubik';
type TextSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
type TextLine = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
type TextWeight = 'regular' | 'semiBold' | 'bold';
type TextColor = 'gray' | 'white' | 'blue' | 'green' | 'gold' | 'red' | 'pink' | 'aqua' | 'dark-blue';

export interface TextProps {
    font?: TextFont;
    size?: TextSize;
    line?: TextLine;
    weight?: TextWeight;
    color?: TextColor;
    italic?: boolean;
    upper?: boolean;
    semantic?: boolean;

    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
}

const cnText = cn(s, 'Text');

const Text: React.FC<TextProps> = ({
    font = 'OpenSans',
    size = 's',
    line: originalLine,
    weight = 'bold',
    color = 'gray',
    italic,
    upper,
    semantic,
    className,
    style,
    children,
}) => {
    useStyles(s);

    const line: TextLine = originalLine ?? size;

    let Tag: 'span' | 'strong' = 'span';
    let elem: React.ReactNode = children;

    if (semantic) {
        if (italic) {
            elem = <em>{elem}</em>;
        }

        if (weight === 'semiBold' || weight === 'bold') {
            Tag = 'strong';
        }
    }

    return (
        <Tag className={cnText({ font, size, line, weight, color, italic, upper }, [className])} style={style}>
            {elem}
        </Tag>
    );
};

export default Text;
