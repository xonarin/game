import { ValuesType } from 'utility-types';

export const emojiAlts = [
    'smile',
    'big_smile',
    'cry_smile',
    'open_eyes_smile',
    'close_eyes_smile',
    'drop_smile',
    'very_smile',
    'angel',
    'devil',
    'wink',
] as const;

export type EmojiAlt = ValuesType<typeof emojiAlts>;
export type EmojiSize = 'xs' | 's' | 'm';
