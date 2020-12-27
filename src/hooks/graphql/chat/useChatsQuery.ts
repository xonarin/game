import { useCallback, useEffect } from 'react';
import { ApolloQueryResult, useApolloClient, useQuery, useSubscription } from '@apollo/client';

import {
    ChatDocument,
    ChatFragment,
    ChatFragmentDoc,
    ChatQuery,
    ChatQueryVariables,
    ChatsDocument,
    ChatsQuery,
    ChatsQueryVariables,
    MessageFragment,
    SentMessageDocument,
    SentMessageSubscription,
} from '../../../__generated__/graphql';
import useMeQuery from '../users/useMeQuery';
import { addMessageIfNotExist } from '../../../cache/messages';
import { addChatIfNotExist } from '../../../cache/chats';

export interface UseChatsQueryResult {
    chats?: ChatsQuery['chats']['items'];
    chatsCount?: ChatsQuery['chats']['count'];
    chat?: ChatQuery['chat'];
    chatsLoading: boolean;
    chatLoading: boolean;
    chatsFetchMore: (chatsOffset: number) => Promise<ApolloQueryResult<ChatsQuery>>;
    chatFetchMore: (messagesOffset: number) => Promise<ApolloQueryResult<ChatQuery>>;
    chatRefetch: (variables?: Partial<ChatQueryVariables>) => Promise<ApolloQueryResult<ChatQuery>>;
}

const useChatsQuery = (
    search: string = '',
    chatId?: string,
    onSentMessage?: (message: MessageFragment) => void,
): UseChatsQueryResult => {
    const client = useApolloClient();

    const fetchNewChat = useCallback(
        async (newChatId: string) => {
            const {
                data: { chat },
            } = await client.query<ChatQuery, ChatQueryVariables>({
                query: ChatDocument,
                variables: { chatId: newChatId },
            });

            if (chat.type !== 'Game') {
                addChatIfNotExist(client.cache, chat);
            }
        },
        [client],
    );

    const { me } = useMeQuery();
    const { data: chatsData, loading: chatsLoading, fetchMore: chatsFetchMore } = useQuery<
        ChatsQuery,
        ChatsQueryVariables
    >(ChatsDocument, { variables: { search } });
    const { data: chatData, loading: chatLoading, fetchMore: chatFetchMore, refetch: chatRefetch } = useQuery<
        ChatQuery,
        ChatQueryVariables
    >(ChatDocument, chatId ? { variables: { chatId } } : { skip: true });
    const { data: sentMessageData } = useSubscription<SentMessageSubscription>(SentMessageDocument);

    const queryChatId = chatData?.chat.id;

    useEffect(() => {
        if (chatData) {
            addChatIfNotExist(client.cache, chatData.chat);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryChatId]);

    useEffect(() => {
        if (!sentMessageData) return;
        const { sentMessage } = sentMessageData;
        if (!sentMessage) return;

        const chatCacheId = `Chat:${sentMessage.chatId}`;
        const chat = client.readFragment<ChatFragment>({
            id: chatCacheId,
            fragmentName: 'Chat',
            fragment: ChatFragmentDoc,
        });

        if (!chat) {
            fetchNewChat(sentMessage.chatId).then();
            return;
        }

        addMessageIfNotExist(client.cache, chatCacheId, sentMessage, sentMessage.sender.id === me?.id);

        if (sentMessage.chatId === chat.id && onSentMessage) {
            onSentMessage(sentMessage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sentMessageData]);

    const augmentedChatsFetchMore = useCallback(
        (chatsOffset: number) => {
            return chatsFetchMore({
                variables: { chatsOffset },
                updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult) return prev;

                    const prevChatIds = new Set(prev.chats.items.map(chat => chat.id));
                    const newChats = fetchMoreResult.chats.items.filter(chat => !prevChatIds.has(chat.id));

                    return {
                        ...prev,
                        chats: {
                            ...prev.chats,
                            items: [...prev.chats.items, ...newChats],
                        },
                    };
                },
            });
        },
        [chatsFetchMore],
    );

    const augmentedChatFetchMore = useCallback(
        (messagesOffset: number) => {
            return chatFetchMore({
                variables: { messagesOffset },
                updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult || prev.chat.id !== fetchMoreResult.chat.id) return prev;

                    const prevMessageIds = new Set(prev.chat.messages.map(message => message.id));
                    const newMessages = fetchMoreResult.chat.messages.filter(
                        message => !prevMessageIds.has(message.id),
                    );

                    return {
                        ...prev,
                        chat: {
                            ...prev.chat,
                            messages: [...newMessages, ...prev.chat.messages],
                        },
                    };
                },
            });
        },
        [chatFetchMore],
    );

    return {
        chats: chatsData?.chats.items,
        chatsCount: chatsData?.chats.count,
        chat: chatData?.chat,
        chatsLoading,
        chatLoading,
        chatsFetchMore: augmentedChatsFetchMore,
        chatFetchMore: augmentedChatFetchMore,
        chatRefetch,
    };
};

export default useChatsQuery;
