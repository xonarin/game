import { useQuery } from '@apollo/client';
import { useEffect } from 'react';

import {
    MinesGameHistoryQueryDocument,
    MinesGameHistoryQueryQuery,
    MinesGameBetSubscription,
    MinesGameBetDocument,
} from '../../../__generated__/graphql';

export interface UseMinesGameHistoryResult {
    loading: boolean;
    minesGameHistory?: MinesGameHistoryQueryQuery['minesGameHistory'];
}

const useMinesGameHistoryQuery = (): UseMinesGameHistoryResult => {
    const { data, loading, subscribeToMore } = useQuery<MinesGameHistoryQueryQuery>(MinesGameHistoryQueryDocument);
    useEffect(() => {
        return subscribeToMore<MinesGameBetSubscription>({
            document: MinesGameBetDocument,
            updateQuery: (prev, { subscriptionData }) => {
                const { minesGameBet } = subscriptionData.data;

                if (!minesGameBet) return prev;

                return {
                    ...prev,
                    minesGameHistory: [minesGameBet, ...prev.minesGameHistory],
                };
            },
        });
    }, [subscribeToMore]);
    return {
        loading,
        minesGameHistory: data && data.minesGameHistory,
    };
};

export default useMinesGameHistoryQuery;
