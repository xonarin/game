import React, { useCallback, useRef, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { FieldInputProps } from 'react-final-form';

import s from './MessageInput.scss';
import emojiStyles from '../../../../assets/emojis/emoji.scss';
import { cn } from '../../../../utils/bem-css-module';
import EmojiContentEditable, { EmojiContentEditableProps } from './EmojiContentEditable';
import Text, { TextProps } from '../../../Text/Text';
import Button from '../../../Button/Button';
import EmojiSelect from './EmojiSelect/EmojiSelect';

export interface MessageInputMobileProps {
    value: string;
    onChange: FieldInputProps<unknown>['onChange'];
    onFocus: FieldInputProps<unknown>['onFocus'];
    onBlur: FieldInputProps<unknown>['onBlur'];
    onSubmit?: () => void;

    isPm?: boolean;
    emojiSize?: EmojiContentEditableProps['emojiSize'];

    font?: TextProps['font'];
    size?: TextProps['size'];
    line?: TextProps['line'];
    weight?: TextProps['weight'];
    color?: TextProps['color'];
    italic?: boolean;
    upper?: boolean;
}

const cnMessageInput = cn(s, 'MessageInput');

const MessageInputMobile: React.FC<MessageInputMobileProps> = ({
    value,
    onChange,
    onFocus,
    onBlur,
    onSubmit,
    isPm,
    emojiSize,
    font = 'OpenSans',
    size = 's',
    line: originalLine,
    weight = 'regular',
    color = 'gray',
    italic,
    upper,
}) => {
    useStyles(s, emojiStyles);

    const line: TextProps['line'] = originalLine ?? size;

    const editableRef = useRef<HTMLDivElement | null>(null);
    const [isFocused, setFocused] = useState(false);

    const handleFocus = useCallback(
        (event: React.FocusEvent<HTMLDivElement>) => {
            onFocus(event);
            setFocused(true);
        },
        [onFocus],
    );

    const handleBlur = useCallback(
        (event: React.FocusEvent<HTMLDivElement>) => {
            onBlur(event);
            setFocused(false);
        },
        [onBlur],
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            const keyCode = event.keyCode || event.which;

            if (!onSubmit || keyCode !== 13 || event.shiftKey) return;

            event.preventDefault();
            onSubmit();
        },
        [onSubmit],
    );

    return (
        <div className={cnMessageInput({ isFocused, isNotEmpty: value !== '', isPm })}>
            <EmojiContentEditable
                className={cnMessageInput('Editable', { font, size, line, weight, color, italic, upper })}
                content={value}
                emojiSize={emojiSize}
                onContentChange={onChange}
                innerRef={editableRef}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onDrop={event => event.preventDefault()}
            />
            <Text
                className={cnMessageInput('Placeholder')}
                font={font}
                size={size}
                line={line}
                weight={weight}
                color={color}
                italic={italic}
                upper={upper}
            >
                Написать сообщение...
            </Text>
            <Button className={cnMessageInput('SmileButton')} icon="smile" clear />
            <EmojiSelect editableElement={editableRef} />
            {isPm && (
                <Button
                    className={cnMessageInput('SendButton')}
                    icon="send"
                    iconSize="s"
                    size="xs"
                    onClick={onSubmit}
                />
            )}
        </div>
    );
};

export default MessageInputMobile;
