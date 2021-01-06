import { GraphQLScalarType } from 'graphql';

import { Resolver, Resolvers, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import { Query, TournamentPayload, QueryTournamentArgs, RefTournamentType } from '../../../__generated__/graphql';

type QueryType = Pick<Query, 'tournament'>;
interface QueryMapping {
    tournament: Resolver<TournamentPayload, QueryTournamentArgs>;
}

type TournamentsResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        URL: GraphQLScalarType;
        DateTime: GraphQLScalarType;
    },
    ApolloContext
>;

const activityPrizes: Record<string, number> = {
    '0': 2500,
    '1': 2500,
    '2': 2500,
    '3': 2500,
    '4': 2500,
    '5': 2500,
};
const referralsPrizes: Record<string, number> = {
    '0': 30,
    '1': 20,
    '2': 10,
    '3': 5,
    '4': 5,
    '5': 5,
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
                    users = allUsers.slice(0, 10).map(item => ({
                        avatar: item.avatar,
                        username: item.username,
                        amount: item.amount,
                        prize: 0,
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

            const userIndex = allUsers.findIndex(item => item.userId === user!.id);;

            return {
                position: userIndex + 1,
                amount: userIndex !== -1 ? allUsers[userIndex].amount : 0,
                finish: lastTournament?.finish,
                users,
            };
        },
    },
};