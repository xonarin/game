import React, { useCallback } from 'react';
import { Form } from 'react-final-form';
import { FormApi } from 'final-form';

import history from '../../../../history';
import useCreatePmChatMutation from '../../../../hooks/graphql/chat/useCreatePmChatMutation';
import MessageField from '../../../fields/MessageField/MessageField';

export interface CreatePmChatValues {
    message: string;
}

export interface CreatePmChatFormProps {
    userId: string;
}

const CreatePmChatForm: React.FC<CreatePmChatFormProps> = ({ userId }) => {
    const createPmChatMutation = useCreatePmChatMutation();

    const onSubmit = useCallback(
        async ({ message }: CreatePmChatValues, form: FormApi<CreatePmChatValues>) => {
            if (!message) return;

            const result = await createPmChatMutation({ userId, message });

            if (result && result.data) {
                history.push(`/messages/${result.data.createPmChat.id}`);
            }

            setTimeout(() => form.reset(), 0);
        },
        [createPmChatMutation, userId],
    );

    return (
        <Form<CreatePmChatValues> onSubmit={onSubmit}>
            {({ handleSubmit }) => <MessageField name="message" onSubmit={handleSubmit} isPm />}
        </Form>
    );
};

export default CreatePmChatForm;
