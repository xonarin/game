import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import {
    ClassicGameState,
    CurrentClassicGameDocument,
    CurrentClassicGameQuery,
    PlacedClassicGameBetDocument,
    PlacedClassicGameBetSubscription,
    StartedClassicGameDocument,
    StartedClassicGameSubscription,
    SwitchedToClassicGameStateCulminationDocument,
    SwitchedToClassicGameStateCulminationSubscription,
    SwitchedToClassicGameStateEndedDocument,
    SwitchedToClassicGameStateEndedSubscription,
    UpdatedClassicGameTimerDocument,
    UpdatedClassicGameTimerSubscription,
} from '../../../__generated__/graphql';

export interface UserCurrentClassicGameQueryResult {
    loading: boolean;
    currentClassicGame?: CurrentClassicGameQuery['currentClassicGame'];
}

const useCurrentClassicGameQuery = (): UserCurrentClassicGameQueryResult => {
    const { data, loading, subscribeToMore } = useQuery<CurrentClassicGameQuery>(CurrentClassicGameDocument, {
        fetchPolicy: 'cache-and-network',
    });

    useEffect(() => {
        subscribeToMore<PlacedClassicGameBetSubscription>({
            document: PlacedClassicGameBetDocument,
            updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data.placedClassicGameBet) return prev;

                const { placedClassicGameBet } = subscriptionData.data;

                return {
                    ...prev,
                    currentClassicGame: {
                        ...prev.currentClassicGame,
                        fund: placedClassicGameBet.fund,
                        bets: [placedClassicGameBet.bet, ...prev.currentClassicGame.bets],
                        players: placedClassicGameBet.players,
                    },
                };
            },
        });

        subscribeToMore<StartedClassicGameSubscription>({
            document: StartedClassicGameDocument,
            updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data.startedClassicGame) return prev;

                const { startedClassicGame } = subscriptionData.data;

                return {
                    ...prev,
                    currentClassicGame: startedClassicGame,
                };
            },
        });

        subscribeToMore<UpdatedClassicGameTimerSubscription>({
            document: UpdatedClassicGameTimerDocument,
            updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data.updatedClassicGameTimer) return prev;

                const { updatedClassicGameTimer } = subscriptionData.data;

                return {
                    ...prev,
                    currentClassicGame: {
                        ...prev.currentClassicGame,
                        state: updatedClassicGameTimer.state,
                        timer: updatedClassicGameTimer.timer,
                        maxTimer: updatedClassicGameTimer.maxTimer,
                    },
                };
            },
        });

        subscribeToMore<SwitchedToClassicGameStateCulminationSubscription>({
            document: SwitchedToClassicGameStateCulminationDocument,
            updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data.switchedToClassicGameStateCulmination) return prev;

                const { switchedToClassicGameStateCulmination } = subscriptionData.data;

                return {
                    ...prev,
                    currentClassicGame: {
                        ...prev.currentClassicGame,
                        state: ClassicGameState.Culmination,
                        culminationDegree: switchedToClassicGameStateCulmination.culminationDegree,
                        remainingCulminationDuration:
                            switchedToClassicGameStateCulmination.remainingCulminationDuration,
                    },
                };
            },
        });

        subscribeToMore<SwitchedToClassicGameStateEndedSubscription>({
            document: SwitchedToClassicGameStateEndedDocument,
            updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data.switchedToClassicGameStateEnded) return prev;

                const { switchedToClassicGameStateEnded } = subscriptionData.data;

                return {
                    ...prev,
                    currentClassicGame: {
                        ...prev.currentClassicGame,
                        state: ClassicGameState.Ended,
                        randomNumber: switchedToClassicGameStateEnded.randomNumber,
                        winnerId: switchedToClassicGameStateEnded.winnerId,
                        winnerUsername: switchedToClassicGameStateEnded.winnerUsername,
                        winnerAvatar: switchedToClassicGameStateEnded.winnerAvatar,
                        winnerTicket: switchedToClassicGameStateEnded.winnerTicket,
                        winnerChance: switchedToClassicGameStateEnded.winnerChance,
                    },
                };
            },
        });
    }, [subscribeToMore]);

    return {
        loading,
        currentClassicGame: data && data.currentClassicGame,
    };
};

export default useCurrentClassicGameQuery;
