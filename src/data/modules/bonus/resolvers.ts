import { IRules } from 'graphql-shield';

import { Resolver, Resolvers, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import { Mutation, MutationCreatePromoCodeArgs, MutationUsePromoCodeArgs, Query } from '../../../__generated__/graphql';
import { isAuth } from '../rules';

type QueryType = Pick<Query, 'hasBonus'>;
type MutationType = Pick<Mutation, 'getBonus' | 'usePromoCode' | 'createPromoCode'>;

interface QueryMapping {
    readonly hasBonus: Resolver<boolean>;
}

interface MutationMapping {
    readonly getBonus: Resolver<number>;
    readonly usePromoCode: Resolver<string, MutationUsePromoCodeArgs>;
    readonly createPromoCode: Resolver<string, MutationCreatePromoCodeArgs>;
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
        usePromoCode: isAuth,
        createPromoCode: isAuth,
    },
};

export const resolvers: BonusResolvers = {
    Query: {
        hasBonus: (_0, _1, { repositories, user }) => repositories.bonus.hasBonus(user!.id),
    },
    Mutation: {
        getBonus: (_0, _1, { repositories, user }) => repositories.bonus.getBonus(user!.id),
        usePromoCode: async (_0, { promoCode }, { repositories, user }) => {
            const { code } = await repositories.bonus.usePromoCode(user!.id, promoCode);

            return code;
        },
        createPromoCode: async (_0, { promoCode, amount, maxUses }, { repositories, user }) => {
            const { code } = await repositories.bonus.createPromoCode(user!.id, promoCode, amount, maxUses);

            return code;
        },
    },
};
