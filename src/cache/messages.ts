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
            updatedAt: (currentUpdatedAt?: Date) => {
                const updatedAt = new Date(message.createdAt);
                if (currentUpdatedAt && currentUpdatedAt >= updatedAt) {
                    return currentUpdatedAt;
                }
                return updatedAt;
            },
            messages: (existingMessageRefs: Reference[] = [], { readField, toReference }) => {
                if (existingMessageRefs.some(ref => readField('id', ref) === message.id)) {
                    return existingMessageRefs;
                }
                return [...existingMessageRefs, toReference(message)];
            },
            messagesCount: (currentMessagesCount: number = 0) => {
                return currentMessagesCount + 1;
            },
            unreadMessagesCount: (currentUnreadMessagesCount: number = 0) => {
                return haveReadChat ? 0 : currentUnreadMessagesCount + 1;
            },
        },
    });
};

export default { addMessageIfNotExist };
