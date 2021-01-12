import { useQuery } from '@apollo/client';

import {
    RefTournamentType,
    TournamentDocument,
    TournamentQuery,
    TournamentQueryVariables,
} from '../../../__generated__/graphql';

export interface UseTournamentQueryResult {
    loading: boolean;
    position?: TournamentQuery['tournament']['position'];
    amount?: TournamentQuery['tournament']['amount'];
    finish?: TournamentQuery['tournament']['finish'];
    users?: TournamentQuery['tournament']['users'];
}

const useTournamentQuery = (type: RefTournamentType): UseTournamentQueryResult => {
    const { data, loading } = useQuery<TournamentQuery, TournamentQueryVariables>(TournamentDocument, {
        variables: { type },
    });

    return {
        loading,
        position: data?.tournament.position,
        amount: data?.tournament.amount,
        finish: data?.tournament.finish,
        users: data?.tournament.users || [],
    };
};

export default useTournamentQuery;
