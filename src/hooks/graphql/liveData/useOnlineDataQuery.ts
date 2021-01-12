import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import {
    OnlineQueryDocument,
    OnlineQueryQuery,
    OnlineQueryQueryVariables,
    OnlineSubscriptionDocument,
    OnlineSubscriptionSubscription,
} from '../../../__generated__/graphql';

interface UseOnlineDataQueryResult {
    loading: boolean;
    online?: OnlineQueryQuery['onlineData'];
}

const useOnlineDataQuery = (): UseOnlineDataQueryResult => {
    const { data, loading, subscribeToMore } = useQuery<OnlineQueryQuery, OnlineQueryQueryVariables>(
        OnlineQueryDocument,
    );

    useEffect(() => {
        const subscriptions: Function[] = [];

        subscriptions.push(
            subscribeToMore<OnlineSubscriptionSubscription>({
                document: OnlineSubscriptionDocument,
                updateQuery: (prev, { subscriptionData }) => {
                    const { onlineData } = subscriptionData.data;

                    return {
                        ...prev,
                        onlineData,
                    };
                },
            }),
        );

        return () => subscriptions.forEach(unsubscribe => unsubscribe());
    }, [subscribeToMore]);

    return {
        loading,
        online: data?.onlineData,
    };
};

export default useOnlineDataQuery;
