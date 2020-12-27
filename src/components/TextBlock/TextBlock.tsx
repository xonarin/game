import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './TextBlock.scss';
import { cn } from '../../utils/bem-css-module';
import Text, { TextProps } from '../Text/Text';

export interface TextBlockProps {
    font?: TextProps['font'];
    size?: TextProps['size'];
    line?: TextProps['line'];
    weight?: TextProps['weight'];
    color?: TextProps['color'];
    italic?: TextProps['italic'];
    upper?: TextProps['upper'];
    maxLines?: number;

    className?: string;
    children: TextProps['children'];
}

const LINE_HEIGHTS = {
    xs: 14,
    s: 16,
    m: 20,
    l: 24,
    xl: 28,
    xxl: 50,
};

const cnTextBlock = cn(s, 'TextBlock');

const TextBlock: React.FC<TextBlockProps> = ({
    font,
    size = 's',
    line,
    weight,
    color,
    italic,
    upper,
    maxLines,
    className,
    children,
}) => {
    useStyles(s);

    return (
        <p
            className={cnTextBlock(null, [className])}
            style={
                maxLines
                    ? { lineClamp: maxLines, WebkitLineClamp: maxLines, maxHeight: maxLines * LINE_HEIGHTS[size] }
                    : undefined
            }
        >
            <Text font={font} size={size} line={line} weight={weight} color={color} italic={italic} upper={upper}>
                {children}
            </Text>
        </p>
    );
};

export default TextBlock;
