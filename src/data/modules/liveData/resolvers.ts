import { GraphQLScalarType } from 'graphql';
import { GraphQLDateTime, GraphQLURL } from 'graphql-scalars';

import { Query, Subscription } from '../../../__generated__/graphql';
import { Resolver, Resolvers, ResolverSubscriber, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import { Repositories } from '../../repositories';
import pubsub from '../../pubsub';
import { getCalculatedOnline } from './utils';

type QueryType = Pick<Query, 'games' | 'onlineData'>;
type SubscriptionType = Pick<Subscription, 'games' | 'onlineData'>;

export type LiveDataGameParent = {
    id: string;
    game: string;
    winner: string;
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
    games: ResolverSubscriber<LiveDataGamesPayloadParent>;
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

export const getLiveDataGames = async (repositories: Repositories) => {
    const items: (Omit<LiveDataGameParent, 'time'> & { time: Date })[] = [];
    const classicGames = await repositories.classicGames.getLastGames(6);
    const minesGames = await repositories.minesGames.getLastGames(6);

    classicGames.forEach(game => {
        items.push({
            id: game.id,
            game: 'classic',
            winner: game.winner?.username || '',
            chance: game.winnerChance || 0,
            bet: game.winnerBetsPrice || 0,
            fund: game.fund,
            time: game.finishedAt || new Date(),
        });
    });

    minesGames.forEach(game => {
        items.push({
            id: game.id,
            game: 'mines',
            // eslint-disable-next-line no-bitwise
            winner: !(game.fieldConf & game.stepsConf) ? game.user?.username || '' : 'Проиграл',
            chance: 100,
            bet: game.betAmount,
            fund: game.betAmount,
            time: game.updatedAt,
        });
    });

    items.sort((a, b) => {
        if (a.time > b.time) {
            return -1;
        }

        if (a.time < b.time) {
            return 1;
        }

        return 0;
    });

    const outputItems = items.map(item => ({
        ...item,
        time: `${item.time.getDate()}.${item.time.getMonth() +
            1}.${item.time.getFullYear()} в ${item.time.getHours()}:${item.time.getMinutes()}`,
    }));
    outputItems.length = 6;

    return outputItems;
};

export const resolvers: LiveDataResolvers = {
    Query: {
        games: async (_0, _1, { repositories }) => {
            const items = await getLiveDataGames(repositories);

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