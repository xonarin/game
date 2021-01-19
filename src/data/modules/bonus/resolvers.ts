import { IRules } from 'graphql-shield';

import { Resolver, Resolvers, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import { Mutation, Query } from '../../../__generated__/graphql';
import { isAuth } from '../rules';

type QueryType = Pick<Query, 'hasBonus'>;
type MutationType = Pick<Mutation, 'getBonus'>;

interface QueryMapping {
    readonly hasBonus: Resolver<boolean>;
}

interface MutationMapping {
    readonly getBonus: Resolver<number>;
}

type BonusResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        Mutation: TypeResolvers<MutationType, MutationMapping>;
    },
    ApolloContext
>;

export const rules: IRules = {
    Query: {
        hasBonus: isAuth,
    },
    Mutation: {
        getBonus: isAuth,
    },
};

export const resolvers: BonusResolvers = {
    Query: {
        hasBonus: (_0, _1, { repositories, user }) => repositories.bonus.hasBonus(user!.id),
    },
    Mutation: {
        getBonus: (_0, _1, { repositories, user }) => repositories.bonus.getBonus(user!.id),
    },
};
