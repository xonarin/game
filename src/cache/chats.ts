import { ApolloCache, Reference } from '@apollo/client';

import { ChatFragment } from '../__generated__/graphql';

export const addChatIfNotExist = (cache: ApolloCache<object>, chat: ChatFragment) => {
    cache.modify({
        id: 'ROOT_QUERY',
        fields: {
            chats: (
                { items = [], count = 0 }: { items?: Reference[]; count?: number } = {},
                { readField, toReference },
            ) => {
                if (items.some(ref => readField('id', ref) === chat.id)) {
                    return { items, count };
                }
                return { items: [...items, toReference(chat)], count };
            },
        },
    });
};

export default { addChatIfNotExist };
