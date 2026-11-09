import { ApolloCache, Reference } from '@apollo/client';

import { ChatFragment, ChatFragmentDoc, MessageFragment } from '../__generated__/graphql';

export const addMessageIfNotExist = (
    cache: ApolloCache<object>,
    chatCacheId: string,
    message: MessageFragment,
    haveReadChat?: boolean,
) => {
    const chat = cache.readFragment<ChatFragment>({
        id: chatCacheId,
        fragment: ChatFragmentDoc,
        fragmentName: 'Chat',
    });
    if (!chat || chat.messages.some(item => item.id === message.id)) return;

    cache.modify({
        id: chatCacheId,
        fields: {
            updatedAt: currentUpdatedAt => {
                const updatedAt = new Date(message.createdAt);
                const current = currentUpdatedAt ? new Date(currentUpdatedAt as string) : undefined;
                if (current && current >= updatedAt) {
                    return currentUpdatedAt;
                }
                return updatedAt.toISOString();
            },
            messages: (existing, { readField, toReference }) => {
                const existingMessageRefs = (existing || []) as Reference[];
                if (existingMessageRefs.some(ref => readField('id', ref) === message.id)) {
                    return existingMessageRefs;
                }
                return [...existingMessageRefs, toReference(message)];
            },
            messagesCount: (currentMessagesCount: number = 0) => currentMessagesCount + 1,
            unreadMessagesCount: (currentUnreadMessagesCount: number = 0) =>
                haveReadChat ? 0 : currentUnreadMessagesCount + 1,
        },
    });
};

export default { addMessageIfNotExist };
