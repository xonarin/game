import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import {
    GamesQueryDocument,
    GamesQueryQuery,
    GamesQueryQueryVariables,
    GamesSubscriptionDocument,
    GamesSubscriptionSubscription,
} from '../../../__generated__/graphql';

interface UseGamesQueryResult {
    loading: boolean;
    games?: GamesQueryQuery['games']['items'];
}

const useGamesQuery = (): UseGamesQueryResult => {
    const { data, loading, subscribeToMore } = useQuery<GamesQueryQuery, GamesQueryQueryVariables>(GamesQueryDocument);

    useEffect(() => {
        const subscriptions: Function[] = [];

        subscriptions.push(
            subscribeToMore<GamesSubscriptionSubscription>({
                document: GamesSubscriptionDocument,
                updateQuery: (prev, { subscriptionData }) => {
                    const { games } = subscriptionData.data;

                    return {
                        ...prev,
                        games,
                    };
                },
            }),
        );

        return () => subscriptions.forEach(unsubscribe => unsubscribe());
    }, [subscribeToMore]);

    return {
        loading,
        games: data?.games.items,
    };
};

export default useGamesQuery;