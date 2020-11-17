import React from 'react';
import { Field } from 'react-final-form';

import MessageInput, { MessageInputProps } from '../../inputs/MessageInput/MessageInput';

export interface MessageFieldProps {
    name: string;
    isPm?: boolean;
    emojiSize?: MessageInputProps['emojiSize'];
    onSubmit?: MessageInputProps['onSubmit'];
}

const MessageField: React.FC<MessageFieldProps> = ({ name, isPm, emojiSize, onSubmit }) => {
    return (
        <Field<string> name={name}>
            {({ input }) => (
                <MessageInput
                    value={input.value}
                    onChange={input.onChange}
                    onFocus={input.onFocus}
                    onBlur={input.onBlur}
                    onSubmit={onSubmit}
                    isPm={isPm}
                    emojiSize={emojiSize}
                />
            )}
        </Field>
    );
};

export default MessageField;
