/* eslint-disable react/no-danger */
import React from 'react';

import { EmojiSize } from '../../../../assets/emojis';
import blankImg from '../../../../assets/emojis/blank.gif';
import emojiStyles from '../../../../assets/emojis/emoji.scss';
import { htmlToText, isEmojiAlt, matchEmojiAlt, textToHtml } from '../../../../utils/message';
import { placeCaretAfter } from '../../../../utils/dom';

type DivProps = JSX.IntrinsicElements['div'];

export interface EmojiContentEditableProps extends DivProps {
    content: string;
    emojiSize?: EmojiSize;
    onContentChange: (content: string) => void;
    innerRef?: React.RefObject<HTMLDivElement>;
}

const isImgElement = (elem: Element): elem is HTMLImageElement => {
    return elem.tagName === 'IMG';
};

class EmojiContentEditable extends React.Component<EmojiContentEditableProps> {
    static defaultProps: Partial<EmojiContentEditableProps> = {
        emojiSize: 'xs',
    };

    private readonly ref = this.props.innerRef || React.createRef<HTMLDivElement>();
    private currentContent: string = this.props.content;

    shouldComponentUpdate(nextProps: Readonly<EmojiContentEditableProps>) {
        return nextProps.content !== this.currentContent;
    }

    componentDidUpdate() {
        const { content, emojiSize } = this.props;
        const { current: elem } = this.ref;

        if (content !== this.currentContent && elem) {
            elem.innerHTML = textToHtml(content, emojiSize!);
        }
    }

    onContentChange = () => {
        this.trimTags();

        const emojiImg = this.emojify();

        const { current: elem } = this.ref;
        if (!elem) return;

        if (emojiImg) {
            placeCaretAfter(elem, emojiImg);
        }

        const content = htmlToText(elem.innerHTML);
        if (content !== this.currentContent) {
            this.props.onContentChange(content);
            this.currentContent = content;
        }
    };

    onBlur = (event: React.FocusEvent<HTMLDivElement>) => {
        this.onContentChange();

        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
    };

    trimTags() {
        const { current: elem } = this.ref;
        if (!elem) return;

        Array.prototype.forEach.call(elem.children, (child: Element) => {
            if (child.tagName === 'BR' || (isImgElement(child) && isEmojiAlt(child.alt))) return;

            elem.replaceChild(document.createTextNode(child.textContent ?? ''), child);
        });

        let prevBrCount = 0;

        Array.prototype.slice.call(elem.childNodes).forEach((child: ChildNode) => {
            if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName === 'BR') {
                if (!child.previousSibling || (child.nextSibling && prevBrCount >= 2)) {
                    child.remove();
                }
                ++prevBrCount;
            } else {
                prevBrCount = 0;
            }
        });
    }

    emojify(lastEmojiImg: HTMLImageElement | null = null): HTMLImageElement | null {
        const { emojiSize } = this.props;
        const { current: elem } = this.ref;

        if (!elem) return lastEmojiImg;

        let matchedNode: ChildNode | undefined;
        let matchedEmojiAlt: [string, number, number] | undefined;

        // Находим первый эмодзи и ноду, в которой он находится
        Array.prototype.some.call(elem.childNodes, (node: ChildNode) => {
            if (node.nodeType !== Node.TEXT_NODE || !node.textContent) return false;

            const match = matchEmojiAlt(node.textContent);
            if (match) {
                matchedNode = node;
                matchedEmojiAlt = match;
                return true;
            }

            return false;
        });

        if (!matchedNode || !matchedEmojiAlt) return lastEmojiImg;

        const { textContent, nextSibling } = matchedNode;
        const [emojiAlt, start, end] = matchedEmojiAlt;

        // Создаем ноду картинки эмодзи
        const emojiImg = document.createElement('img');
        emojiImg.className = `${emojiStyles.Emoji} ${emojiStyles[`Emoji_alt_${emojiAlt.slice(1, -1)}`]} ${
            emojiStyles[`Emoji_size_${emojiSize}`]
        }`;
        emojiImg.src = blankImg;
        emojiImg.alt = emojiAlt;

        const beforeText = textContent!.slice(0, start);
        const afterText = textContent!.slice(end);

        // Вставляем ноду картинки эмодзи в инпут
        if (beforeText) elem.insertBefore(document.createTextNode(beforeText), matchedNode);
        if (afterText) elem.insertBefore(document.createTextNode(afterText), nextSibling);
        elem.replaceChild(emojiImg, matchedNode);

        return this.emojify(emojiImg);
    }

    render() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { content, emojiSize, onContentChange, innerRef, ...restProps } = this.props;

        return (
            <div {...restProps} contentEditable onInput={this.onContentChange} onBlur={this.onBlur} ref={this.ref} />
        );
    }
}

export default EmojiContentEditable;
