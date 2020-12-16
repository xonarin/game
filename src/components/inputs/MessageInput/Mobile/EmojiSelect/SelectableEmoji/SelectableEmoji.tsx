import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './SelectableEmoji.scss';
import { cn } from '../../../../../../utils/bem-css-module';
import Emoji, { EmojiProps } from '../../../../../Emoji/Emoji';

export interface SelectableEmojiProps {
    alt: EmojiProps['alt'];
    size: EmojiProps['size'];
    onClick: (emojiAlt: EmojiProps['alt']) => void;
}

const cnSelectableEmoji = cn(s, 'SelectableEmoji');

const SelectableEmoji: React.FC<SelectableEmojiProps> = ({ alt, size, onClick }) => {
    useStyles(s);

    return (
        <button className={cnSelectableEmoji()} type="button" onClick={() => onClick(alt)}>
            <Emoji className={cnSelectableEmoji('Emoji')} alt={alt} size={size} />
        </button>
    );
};

export default SelectableEmoji;
