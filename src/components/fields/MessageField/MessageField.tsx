import React from 'react';
import { Field } from 'react-final-form';

import MessageInputMobile from '../../inputs/MessageInput/Mobile/MessageInput';
import MessageInput, { MessageInputProps } from '../../inputs/MessageInput/Web/MessageInput';

export interface MessageFieldProps {
    name: string;
    isPm?: boolean;
    emojiSize?: MessageInputProps['emojiSize'];
    onSubmit?: MessageInputProps['onSubmit'];
    mobile?:Boolean;
}

const MessageField: React.FC<MessageFieldProps> = ({ name, isPm, emojiSize, onSubmit,mobile }) => {
    if(mobile){
        return(
            <Field<string> name={name}>
            {({ input }) => (
                <MessageInputMobile
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
        )
    }
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
