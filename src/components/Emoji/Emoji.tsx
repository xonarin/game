import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from '../../assets/emojis/emoji.scss';
import { cn } from '../../utils/bem-css-module';
import { EmojiAlt, EmojiSize } from '../../assets/emojis';
import blankImg from '../../assets/emojis/blank.gif';

export interface EmojiProps {
    alt: EmojiAlt;
    size?: EmojiSize;
    className?: string;
}

const cnEmoji = cn(s, 'Emoji');

const Emoji: React.FC<EmojiProps> = ({ alt, size = 's', className }) => {
    useStyles(s);

    return <img className={cnEmoji({ alt, size }, [className])} src={blankImg} alt={`:${alt}:`} />;
};

export default Emoji;
