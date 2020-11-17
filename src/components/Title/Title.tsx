import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Tittle.scss';
import { cn } from '../../utils/bem-css-module';
import Text, { TextProps } from '../Text/Text';

type TitleType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface TitleProps {
    type?: TitleType;
    font?: TextProps['font'];
    size?: TextProps['size'];
    line?: TextProps['line'];
    weight?: TextProps['weight'];
    color?: TextProps['color'];
    italic?: TextProps['italic'];
    upper?: TextProps['upper'];

    className?: string;
    children: TextProps['children'];
}

const cnTitle = cn(s, 'Title');

const Title: React.FC<TitleProps> = ({
    type = 'h1',
    font,
    size = 'xxl',
    line,
    color = 'white',
    weight = 'bold',
    italic,
    upper,
    className,
    children,
}) => {
    useStyles(s);

    const Tag = type;

    return (
        <Tag className={cnTitle(null, [className])}>
            <Text font={font} size={size} line={line} weight={weight} color={color} italic={italic} upper={upper}>
                {children}
            </Text>
        </Tag>
    );
};

export default Title;
