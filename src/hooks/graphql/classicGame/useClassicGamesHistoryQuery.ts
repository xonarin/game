import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import {
    ClassicGamesHistoryDocument,
    ClassicGamesHistoryQuery,
    SwitchedToClassicGameStateEndedDocument,
    SwitchedToClassicGameStateEndedSubscription,
} from '../../../__generated__/graphql';

export interface UseClassicGamesHistoryQueryResult {
    loading: boolean;
    classicGamesHistory?: ClassicGamesHistoryQuery['classicGamesHistory'];
}

const useClassicGamesHistory = (): UseClassicGamesHistoryQueryResult => {
    const { data, loading, subscribeToMore } = useQuery<ClassicGamesHistoryQuery>(ClassicGamesHistoryDocument);

    useEffect(() => {
        return subscribeToMore<SwitchedToClassicGameStateEndedSubscription>({
            document: SwitchedToClassicGameStateEndedDocument,
            updateQuery: (prev, { subscriptionData }) => {
                const { switchedToClassicGameStateEnded } = subscriptionData.data;
                if (!switchedToClassicGameStateEnded) return prev;

                return {
                    ...prev,
                    classicGamesHistory: [switchedToClassicGameStateEnded, ...prev.classicGamesHistory],
                };
            },
        });
    }, [subscribeToMore]);

    return {
        loading,
        classicGamesHistory: data && data.classicGamesHistory,
    };
};

export default useClassicGamesHistory;
