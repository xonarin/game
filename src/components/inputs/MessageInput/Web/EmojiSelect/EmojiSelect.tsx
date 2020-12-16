import React, { useCallback, useEffect, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './EmojiSelect.scss';
import { cn } from '../../../../../utils/bem-css-module';
import { EmojiAlt, emojiAlts } from '../../../../../assets/emojis';
import Scrollable from '../../../../Scrollable/Scrollable';
import Text from '../../../../Text/Text';
import SelectableEmoji from './SelectableEmoji/SelectableEmoji';
import { placeCaretAfter } from '../../../../../utils/dom';

export interface EmojiSelectProps {
    editableElement?: React.RefObject<HTMLDivElement>;
}

const cnEmojiSelect = cn(s, 'EmojiSelect');

const EmojiSelect: React.FC<EmojiSelectProps> = ({ editableElement }) => {
    useStyles(s);

    const [latest, setLatest] = useState<EmojiAlt[]>([]);

    const onClickEmoji = useCallback(
        (emojiAlt: EmojiAlt) => {
            // Фокус на инпут и установка каретки в конец, если он до этого не был в фокусе
            if (editableElement && editableElement.current) {
                const selection = window.getSelection();
                const selectedNode =
                    selection && selection.rangeCount > 0 ? selection.getRangeAt(0).startContainer : null;

                if (selectedNode !== editableElement.current && !editableElement.current.contains(selectedNode)) {
                    editableElement.current.focus();

                    const { lastChild } = editableElement.current;
                    if (lastChild) {
                        placeCaretAfter(editableElement.current, lastChild);
                    }
                }
            }

            document.execCommand('insertText', false, `:${emojiAlt}:`);

            const newLatest = [emojiAlt, ...latest.filter(item => item !== emojiAlt).slice(0, 5)];

            setLatest(newLatest);
            localStorage.setItem('latestEmojis', newLatest.join(','));
        },
        [editableElement, latest],
    );

    useEffect(() => {
        setLatest(
            (localStorage.getItem('latestEmojis') ?? '')
                .split(',')
                .filter(item => emojiAlts.includes(item as EmojiAlt)) as EmojiAlt[],
        );
    }, []);

    return (
        <div className={cnEmojiSelect()}>
            <div className={cnEmojiSelect('Container')}>
                <Scrollable className={cnEmojiSelect('Content')}>
                    {latest.length > 0 && (
                        <>
                            <Text>Недавние</Text>
                            <div className={cnEmojiSelect('Block')}>
                                {latest.map(emojiAlt => (
                                    <SelectableEmoji alt={emojiAlt} size="m" onClick={onClickEmoji} key={emojiAlt} />
                                ))}
                            </div>
                        </>
                    )}
                    <Text>Эмоции</Text>
                    <div className={cnEmojiSelect('Block')}>
                        {emojiAlts.map(emojiAlt => (
                            <SelectableEmoji alt={emojiAlt} size="m" onClick={onClickEmoji} key={emojiAlt} />
                        ))}
                    </div>
                </Scrollable>
            </div>
        </div>
    );
};

export default EmojiSelect;
