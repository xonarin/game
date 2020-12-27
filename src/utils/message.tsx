import React from 'react';

import blankImg from '../assets/emojis/blank.gif';
import emojiStyles from '../assets/emojis/emoji.scss';
import { EmojiAlt, emojiAlts, EmojiSize } from '../assets/emojis';
import Emoji, { EmojiProps } from '../components/Emoji/Emoji';

export type StringOrElement = string | React.ReactElement;

export const emojiAltRegexp = new RegExp(emojiAlts.map(emojiAlt => `:${emojiAlt}:`).join('|'), 'g');
export const emojiImgRegexp = new RegExp(`<img.+?alt="(${emojiAltRegexp.source})".*?/?>`, 'g');
export const tagRegexp = /<\\?.+?>/g;

export const isEmojiAlt = (text: string): boolean => {
    return new RegExp(`^(${emojiAltRegexp.source})$`).test(text);
};

export const emojiAltToImg = (alt: EmojiAlt, size: EmojiSize): string => {
    return `<img class="${emojiStyles.Emoji} ${emojiStyles[`Emoji_alt_${alt}`]} ${
        emojiStyles[`Emoji_size_${size}`]
    }" src="${blankImg}" alt=":${alt}:">`;
};

export const textToHtml = (text: string, emojiSize: EmojiSize): string => {
    return text
        .replace(new RegExp(emojiAltRegexp), emojiAlt => emojiAltToImg(emojiAlt.slice(1, -1) as EmojiAlt, emojiSize))
        .replace(/&/g, '&amp;')
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;')
        .replace(/\n/g, '<br>');
};

export const htmlToText = (html: string): string => {
    return html
        .replace(/<br>/g, '\n')
        .replace(new RegExp(emojiImgRegexp), (_0, emojiAlt) => emojiAlt)
        .replace(new RegExp(tagRegexp), '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

export const matchEmojiAlt = (text: string): [string, number, number] | null => {
    const match = new RegExp(emojiAltRegexp).exec(text);
    return match && [match[0] as EmojiAlt, match.index, match.index + match[0].length];
};

export const trimTags = (html: string): string => {
    const emojiImgRegexpClone = new RegExp(emojiImgRegexp);

    return html.replace(new RegExp(tagRegexp), match => {
        if (match === '<br>' || emojiImgRegexpClone.test(match)) {
            return match;
        }

        return '';
    });
};

export const emojify = (elements: StringOrElement[]): StringOrElement[] => {
    let matchedIndex: number | undefined;
    let matchedEmojiAlt: [string, number, number] | undefined;

    elements.some((elem, index) => {
        if (typeof elem !== 'string') return false;

        const match = matchEmojiAlt(elem);
        if (match) {
            matchedIndex = index;
            matchedEmojiAlt = match;
            return true;
        }

        return false;
    });

    if (typeof matchedIndex === 'undefined' || !matchedEmojiAlt) {
        return elements;
    }

    const matchedString = elements[matchedIndex] as string;
    const [emojiAlt, start, end] = matchedEmojiAlt;

    return emojify([
        ...elements.slice(0, matchedIndex),
        matchedString.slice(0, start),
        <Emoji alt={emojiAlt.slice(1, -1) as EmojiProps['alt']} />,
        matchedString.slice(end),
        ...elements.slice(matchedIndex + 1),
    ]);
};

export const transformNewLines = (elements: StringOrElement[]): StringOrElement[] => {
    let matchedIndex: number | undefined;
    let matchedStart: number | undefined;
    let matchedEnd: number | undefined;

    elements.some((elem, index) => {
        if (typeof elem !== 'string') return false;

        const match = /\n/.exec(elem);
        if (match) {
            matchedIndex = index;
            matchedStart = match.index;
            matchedEnd = match.index + match[0].length;
            return true;
        }

        return false;
    });

    if (
        typeof matchedIndex === 'undefined' ||
        typeof matchedStart === 'undefined' ||
        typeof matchedEnd === 'undefined'
    ) {
        return elements;
    }

    const matchedString = elements[matchedIndex] as string;

    return transformNewLines([
        ...elements.slice(0, matchedIndex),
        matchedString.slice(0, matchedStart),
        <br />,
        matchedString.slice(matchedEnd),
        ...elements.slice(matchedIndex + 1),
    ]);
};

export const transformMessage = (message: string): React.ReactNode => {
    return React.createElement(React.Fragment, null, ...transformNewLines(emojify([message])).filter(Boolean));
};
