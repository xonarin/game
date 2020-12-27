import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import {
    ChatType,
    SentMessageDocument,
    SentMessageSubscription,
    UnreadCountDocument,
    UnreadCountQuery,
} from '../../../__generated__/graphql';

export interface UseUnreadCountQueryResult {
    unreadCount?: UnreadCountQuery['unreadCount'];
    loading: boolean;
}

const useUnreadCountQuery = (): UseUnreadCountQueryResult => {
    const { data, loading, subscribeToMore } = useQuery<UnreadCountQuery>(UnreadCountDocument);

    useEffect(() => {
        return subscribeToMore<SentMessageSubscription>({
            document: SentMessageDocument,
            updateQuery: (prev, { subscriptionData }) => {
                const { sentMessage } = subscriptionData.data;
                if (!sentMessage || sentMessage.chatType === ChatType.Game) return prev;

                return {
                    ...prev,
                    unreadCount: prev.unreadCount + 1,
                };
            },
        });
    }, [subscribeToMore]);

    return {
        unreadCount: data?.unreadCount,
        loading,
    };
};

export default useUnreadCountQuery;
