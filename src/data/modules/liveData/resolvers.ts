import { GraphQLScalarType } from 'graphql';
import { GraphQLDateTime, GraphQLURL } from 'graphql-scalars';

import { Query, Subscription } from '../../../__generated__/graphql';
import { Resolver, Resolvers, ResolverSubscriber, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import pubsub from '../../pubsub';
import { getCalculatedOnline } from './utils';
import { getGames } from '../../../services/LiveData/LiveDataStorage';

type QueryType = Pick<Query, 'games' | 'onlineData'>;
type SubscriptionType = Pick<Subscription, 'games' | 'onlineData'>;

export type LiveDataGameParent = {
    id: string;
    game: string;
    winner: string;
    avatar: string;
    chance: number;
    bet: number;
    fund: number;
    time: string;
};

export type LiveDataGamesPayloadParent = {
    items: LiveDataGameParent[];
    count: number;
};

export type OnlinePayloadParent = {
    online: number;
};

interface QueryMapping {
    games: Resolver<LiveDataGamesPayloadParent>;
    onlineData: Resolver<OnlinePayloadParent>;
}

interface SubscriptionMapping {
    games: ResolverSubscriber<LiveDataGameParent>;
    onlineData: ResolverSubscriber<OnlinePayloadParent>;
}

type LiveDataResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        Subscription: TypeResolvers<SubscriptionType, SubscriptionMapping>;
        URL: GraphQLScalarType;
        DateTime: GraphQLScalarType;
    },
    ApolloContext
>;

export const getLiveDataGames = async (): Promise<LiveDataGameParent[]> => {
    const items = await getGames();

    return items;
};

export const resolvers: LiveDataResolvers = {
    Query: {
        games: async () => {
            const items = await getLiveDataGames();

            return {
                items,
                count: items.length,
            };
        },
        onlineData: async () => {
            const online = await getCalculatedOnline();

            return { online };
        },
    },
    Subscription: {
        games: {
            subscribe: () => pubsub.asyncIterator('games'),
        },
        onlineData: {
            subscribe: () => pubsub.asyncIterator('onlineData'),
        },
    },
    URL: GraphQLURL,
    DateTime: GraphQLDateTime,
};
