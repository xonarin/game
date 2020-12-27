import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './TextInBox.scss';
import { cn } from '../../utils/bem-css-module';
import Text, { TextProps } from '../Text/Text';

export interface TextInBoxProps {
    font?: TextProps['font'];
    size?: TextProps['size'];
    weight?: TextProps['weight'];
    color?: TextProps['color'];
    italic?: TextProps['italic'];
    upper?: TextProps['upper'];
    children: TextProps['children'];
}

const cnTextInBox = cn(s, 'TextInBox');

const TextInBox: React.FC<TextInBoxProps> = ({ font, size = 's', weight, color, italic, upper, children }) => {
    useStyles(s);

    return (
        <div className={cnTextInBox()}>
            <Text
                className={cnTextInBox('Text')}
                font={font}
                size={size}
                weight={weight}
                color={color}
                italic={italic}
                upper={upper}
            >
                {children}
            </Text>
        </div>
    );
};

export default TextInBox;
