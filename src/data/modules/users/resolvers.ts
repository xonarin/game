import { GraphQLScalarType } from 'graphql';
import { GraphQLURL } from 'graphql-scalars';
import { and, IRules } from 'graphql-shield';

import { Resolver, Resolvers, ResolverSubscriber, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import {
    BalanceSubscription,
    Mutation,
    MutationUpdateClientSeedArgs,
    Query,
    QueryUserArgs,
    Subscription,
    UpdateServerSeedPayload,
    User,
} from '../../../__generated__/graphql';
import { User as UserBackend } from '../../models/User';
import { isAuth } from '../rules';
import { checkUpdateClientSeedArgs } from './rules';
import { sha256Hash } from '../../../utils/crypto';
import { database } from '../../database';
import { withFilter } from '../../../utils/withFilter';
import pubsub, { BalanceSubscriptionPayload } from '../../pubsub';

export type OriginUserParent = UserBackend;

type QueryType = Pick<Query, 'me' | 'user' | 'fairPlay' | 'usersTotal'>;
type MutationType = Pick<Mutation, 'updateClientSeed' | 'updateServerSeed'>;
type SubscriptionType = Pick<Subscription, 'balance'>;
type UserType = Pick<User, 'id' | 'role' | 'username' | 'avatar' | 'money'>;
type BalanceSubscriptionType = Pick<BalanceSubscription, 'money' | 'maxReached'>;

interface QueryMapping {
    me: Resolver<OriginUserParent | null>;
    user: Resolver<OriginUserParent | null, QueryUserArgs>;
}

interface MutationMapping {
    updateClientSeed: Resolver<string, MutationUpdateClientSeedArgs>;
    updateServerSeed: Resolver<UpdateServerSeedPayload>;
}

interface SubscriptionMapping {
    balance: ResolverSubscriber<BalanceSubscriptionType, BalanceSubscriptionPayload>;
}

type UsersResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        Mutation: TypeResolvers<MutationType, MutationMapping>;
        Subscription: TypeResolvers<SubscriptionType, SubscriptionMapping>;
        User: TypeResolvers<UserType, {}, OriginUserParent>;
        BalanceSubscription: TypeResolvers<BalanceSubscriptionType, {}, BalanceSubscriptionPayload>;
        URL: GraphQLScalarType;
    },
    ApolloContext
>;

export const rules: IRules = {
    Query: {
        fairPlay: isAuth,
    },
    Mutation: {
        updateClientSeed: and(isAuth, checkUpdateClientSeedArgs),
        updateServerSeed: isAuth,
    },
};

export const resolvers: UsersResolvers = {
    Query: {
        me: (_0, _1, { user }) => {
            return user || null;
        },
        user: (_0, { userId }, { repositories }) => {
            return repositories.users.getUserById(userId);
        },
        fairPlay: (_0, _1, { user }) => {
            return {
                clientSeed: user!.clientSeed,
                serverSeedHash: sha256Hash(user!.serverSeed),
                nonce: user!.nonce,
            };
        },
        usersTotal: () => database.User.count(),
    },
    Mutation: {
        updateClientSeed: async (_0, { clientSeed }, { user, repositories }) => {
            const { clientSeed: newClientSeed } = await repositories.users.updateClientSeed(
                user!.id,
                clientSeed ?? undefined,
            );

            return newClientSeed;
        },
        updateServerSeed: async (_0, _1, { user, repositories }) => {
            const oldServerSeed = await repositories.users.updateServerSeed(user!.id);
            const { serverSeed: newServerSeed } = await repositories.users.getUserByIdStrict(user!.id);

            return {
                oldServerSeed,
                newServerSeedHash: sha256Hash(newServerSeed),
            };
        },
    },
    Subscription: {
        balance: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('balance'),
                ({ balance: { userId } }, _, { user }) => userId === user?.id,
            ),
        },
    },
    User: {
        money: (parent, _0, { user }) => {
            return user && user.id === parent.id ? parent.money : undefined;
        },
    },
    URL: GraphQLURL,
};
