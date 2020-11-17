import { useCallback } from 'react';
import { FetchResult } from '@apollo/client';

import {
    ChatFragment,
    ChatFragmentDoc,
    SendMessageDocument,
    SendMessageInput,
    SendMessageMutation,
    SendMessageMutationVariables,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';
import { addMessageIfNotExist } from '../../../cache/messages';

export interface UseSendMessageMutationResult {
    (input: SendMessageInput): Promise<FetchResult<SendMessageMutation>>;
}

const useSendMessageMutation = (): UseSendMessageMutationResult => {
    const [sendMessage] = useMutationWithNotify<SendMessageMutation, SendMessageMutationVariables>(
        SendMessageDocument,
        {
            update: (cache, { data: mutationData }) => {
                if (!mutationData) return;
                const { sendMessage: sentMessage } = mutationData;

                const chatCacheId = `Chat:${sentMessage.chatId}`;
                const chat = cache.readFragment<ChatFragment>({
                    id: chatCacheId,
                    fragmentName: 'Chat',
                    fragment: ChatFragmentDoc,
                });
                if (!chat) return;

                addMessageIfNotExist(cache, chatCacheId, sentMessage, true);
            },
        },
    );

    return useCallback(input => sendMessage({ variables: { input } }), [sendMessage]);
};

export default useSendMessageMutation;
