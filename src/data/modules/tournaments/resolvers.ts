import { GraphQLScalarType } from 'graphql';
import { GraphQLDateTime, GraphQLURL } from 'graphql-scalars';

import { Resolver, Resolvers, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import {
    Query,
    TournamentPayload,
    QueryTournamentArgs,
    RefTournamentType,
    UserPayload,
} from '../../../__generated__/graphql';

type QueryType = Pick<Query, 'tournament'>;
type TournamentPayloadType = Pick<TournamentPayload, 'amount' | 'finish' | 'position' | 'users'>;

interface TournamentPayloadParent {
    position: number;
    amount: number;
    finish?: Date | null;
    users: UserPayload[];
}

interface QueryMapping {
    tournament: Resolver<TournamentPayloadParent, QueryTournamentArgs>;
}

interface TournamentPayloadMapping {
    finish?: Date | null;
}

type TournamentsResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        TournamentPayload: TypeResolvers<TournamentPayloadType, TournamentPayloadMapping, TournamentPayloadParent>;
        DateTime: GraphQLScalarType;
        URL: GraphQLScalarType;
    },
    ApolloContext
>;

const MonthPrizes: Record<string, number> = {
    '0': 5000,
    '1': 3000,
    '2': 2000,
    '3': 0,
    '4': 0,
    '5': 0,
};

const activityPrizes: Record<string, number> = {
    '0': 1500,
    '1': 1000,
    '2': 500,
    '3': 0,
    '4': 0,
    '5': 0,
};

const referralsPrizes: Record<string, number> = {
    '0': 20,
    '1': 15,
    '2': 10,
    '3': 0,
    '4': 0,
    '5': 0,
};

export const resolvers: TournamentsResolvers = {
    Query: {
        tournament: async (_0, { type }, { user, repositories }) => {
            const lastTournament = await repositories.tournaments.getLastTournament(type);
            let users: {
                avatar: string;
                username: string;
                amount: number;
                prize: number;
            }[] = [];

            const allUsers = await repositories.tournaments.getLeaders(lastTournament!);

            switch (type) {
                case RefTournamentType.Monthly:
                    users = allUsers.slice(0, 10).map((item, index) => ({
                        avatar: item.avatar,
                        username: item.username,
                        amount: item.amount,
                        prize: MonthPrizes[index.toString()] || 0,
                    }));
                    break;
                case RefTournamentType.Activity:
                    users = allUsers.slice(0, 6).map((item, index) => ({
                        avatar: item.avatar,
                        username: item.username,
                        amount: item.amount,
                        prize: activityPrizes[index.toString()] || 0,
                    }));
                    break;
                case RefTournamentType.Referrals:
                    users = allUsers.slice(0, 6).map((item, index) => ({
                        avatar: item.avatar,
                        username: item.username,
                        amount: item.amount,
                        prize: referralsPrizes[index],
                    }));
                    break;
                default:
            }

            const userIndex = allUsers.findIndex(item => item.userId === user!.id);

            return {
                position: userIndex + 1,
                amount: userIndex !== -1 ? allUsers[userIndex].amount : 0,
                finish: lastTournament?.finish,
                users,
            };
        },
    },

    TournamentPayload: {
        finish: parent => parent.finish,
    },

    DateTime: GraphQLDateTime,
    URL: GraphQLURL,
};
