import { useCallback, useEffect } from 'react';
import { ApolloQueryResult, useQuery } from '@apollo/client';

import {
    ChatDocument,
    ChatQuery,
    ChatQueryVariables,
    DeletedMessageDocument,
    DeletedMessagesBySenderDocument,
    DeletedMessagesBySenderSubscription,
    DeletedMessagesBySenderSubscriptionVariables,
    DeletedMessageSubscription,
    DeletedMessageSubscriptionVariables,
    MessageFragment,
    SentMessageDocument,
    SentMessageSubscription,
} from '../../../__generated__/graphql';

export interface UseChatQueryResult {
    loading: boolean;
    chat?: ChatQuery['chat'];
    fetchMore: (messagesOffset: number) => Promise<ApolloQueryResult<ChatQuery>>;
}

const useChatQuery = (chatId: string, onSentMessage?: (message: MessageFragment) => void): UseChatQueryResult => {
    const { data, loading, subscribeToMore, fetchMore } = useQuery<ChatQuery, ChatQueryVariables>(ChatDocument, {
        variables: { chatId },
    });

    useEffect(() => {
        const subscriptions: Function[] = [];

        subscriptions.push(
            subscribeToMore<SentMessageSubscription>({
                document: SentMessageDocument,
                updateQuery: (prev, { subscriptionData }) => {
                    const { sentMessage } = subscriptionData.data;

                    if (
                        !sentMessage ||
                        sentMessage.chatId !== chatId ||
                        prev.chat.messages.some(message => message.id === sentMessage.id)
                    ) {
                        return prev;
                    }

                    if (onSentMessage) {
                        onSentMessage(sentMessage);
                    }

                    return {
                        ...prev,
                        chat: {
                            ...prev.chat,
                            updatedAt: sentMessage.createdAt,
                            messages: [...prev.chat.messages, sentMessage],
                            messagesCount: prev.chat.messagesCount + 1,
                        },
                    };
                },
            }),
        );

        subscriptions.push(
            subscribeToMore<DeletedMessageSubscription, DeletedMessageSubscriptionVariables>({
                document: DeletedMessageDocument,
                variables: { chatId },
                updateQuery: (prev, { subscriptionData }) => {
                    const { deletedMessage } = subscriptionData.data;

                    if (!deletedMessage) return prev;

                    return {
                        ...prev,
                        chat: {
                            ...prev.chat,
                            messages: prev.chat.messages.filter(message => message.id !== deletedMessage.messageId),
                            messagesCount: prev.chat.messagesCount - 1,
                        },
                    };
                },
            }),
        );

        subscriptions.push(
            subscribeToMore<DeletedMessagesBySenderSubscription, DeletedMessagesBySenderSubscriptionVariables>({
                document: DeletedMessagesBySenderDocument,
                variables: { chatId },
                updateQuery: (prev, { subscriptionData }) => {
                    const { deletedMessagesBySender } = subscriptionData.data;

                    if (!deletedMessagesBySender) return prev;

                    const filteredMessages = prev.chat.messages.filter(
                        message => message.sender.id !== deletedMessagesBySender.senderId,
                    );

                    return {
                        ...prev,
                        chat: {
                            ...prev.chat,
                            messages: filteredMessages,
                            messagesCount:
                                prev.chat.messagesCount - prev.chat.messages.length + filteredMessages.length,
                        },
                    };
                },
            }),
        );

        return () => subscriptions.forEach(unsubscribe => unsubscribe());
    }, [subscribeToMore, chatId, onSentMessage]);

    const augmentedFetchMore = useCallback(
        (messagesOffset: number) => {
            return fetchMore({
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
        [fetchMore],
    );

    return {
        loading,
        chat: data?.chat,
        fetchMore: augmentedFetchMore,
    };
};

export default useChatQuery;
