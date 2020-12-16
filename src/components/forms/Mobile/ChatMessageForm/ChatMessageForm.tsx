import React, { useCallback } from 'react';
import { Form } from 'react-final-form';
import { FormApi } from 'final-form';

import { MessageFragment } from '../../../../__generated__/graphql';
import MessageField from '../../../fields/MessageField/MessageField';
import useSendMessageMutation from '../../../../hooks/graphql/chat/useSendMessageMutation';

export interface ChatMessageFormValues {
    message: string;
}

export interface ChatMessageFormProps {
    chatId: string;
    onMutate?: (message: MessageFragment) => void;
    isPm?: boolean;
}

const ChatMessageForm: React.FC<ChatMessageFormProps> = ({ chatId, onMutate, isPm }) => {
    const sendMessageMutation = useSendMessageMutation();

    const onSubmit = useCallback(
        async ({ message }: ChatMessageFormValues, form: FormApi<ChatMessageFormValues>) => {
            if (!message) return;

            setTimeout(() => form.reset(), 0);
            setTimeout(
                () =>
                    sendMessageMutation({ chatId, message }).then(
                        result => onMutate && result?.data && onMutate(result.data.sendMessage),
                    ),
                0,
            );
        },
        [sendMessageMutation, chatId, onMutate],
    );

    return (
        <Form<ChatMessageFormValues> onSubmit={onSubmit}>
            {({ handleSubmit }) => <MessageField name="message" onSubmit={handleSubmit} isPm={isPm} mobile/>}
        </Form>
    );
};

export default ChatMessageForm;
