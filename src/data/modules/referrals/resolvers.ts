import { GraphQLScalarType } from 'graphql';
import { GraphQLDateTime, GraphQLURL } from 'graphql-scalars';
import { and, IRules } from 'graphql-shield';

import { Resolver, Resolvers, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import {
    GetReferralMoneyMutationVariables,
    GraphDataEntry,
    Mutation,
    Query,
    QueryReferralLinkArgs,
    QueryReferralsArgs,
    QueryReferralsStatsArgs,
    Referral,
    ReferralsPayload,
    ReferralsStatsPayload,
    RefStatsType,
} from '../../../__generated__/graphql';
import { isAuth } from '../rules';
import { checkReferralsArgs } from './rules';
import { moneyRound } from '../../../utils/money';

type QueryType = Pick<Query, 'referrals' | 'referralsStats' | 'referralLink'>;
type MutationType = Pick<Mutation, 'getReferralMoney'>;

interface QueryMapping {
    referrals: Resolver<ReferralsPayload, QueryReferralsArgs>;
    referralsStats: Resolver<ReferralsStatsPayload, QueryReferralsStatsArgs>;
    referralLink: Resolver<string, QueryReferralLinkArgs>;
}

interface MutationMapping {
    getReferralMoney: Resolver<string, GetReferralMoneyMutationVariables>;
}

type ReferralsResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        Mutation: TypeResolvers<MutationType, MutationMapping>;
        Referral: TypeResolvers<Referral, {}, Referral>;
        GraphData: TypeResolvers<GraphDataEntry, {}, GraphDataEntry>;
        ReferralsStatsPayload: TypeResolvers<ReferralsStatsPayload, {}, ReferralsStatsPayload>;
        URL: GraphQLScalarType;
        DateTime: GraphQLScalarType;
    },
    ApolloContext
>;

export const rules: IRules = {
    Query: {
        referrals: and(isAuth, checkReferralsArgs),
        referralsStats: isAuth,
        referralLink: isAuth,
    },
    Mutation: {
        getReferralMoney: isAuth,
    },
};

export const resolvers: ReferralsResolvers = {
    Query: {
        referrals: async (_0, { offset }, { user, repositories }) => {
            const count = await repositories.users.getReferralsCount(user!.id);
            const items = await repositories.users.getReferrals(user!.id, offset ?? 0);

            return {
                count,
                items,
            };
        },
        referralsStats: async (_0, { type, period }, { user, repositories }) => {
            if (type === RefStatsType.Income) {
                const entries = await repositories.referralIncomes.getIncomeStats(user!.id, period);
                return {
                    fullAmount: moneyRound(user!.refMoney),
                    mainValue: moneyRound(entries.reduce((acc, entry) => acc + entry.value, 0)),
                    entries,
                };
            }

            // type === RefStatsType.Count
            const referralsCount = await repositories.users.getReferralsCount(user!.id);
            const entries = await repositories.users.getReferralsStats(user!.id, period);
            return {
                fullAmount: referralsCount,
                mainValue: moneyRound(entries.reduce((acc, entry) => acc + entry.value, 0)),
                entries,
            };
        },
        referralLink: async (_0, { domain }, { user }) => `${domain}/?ref=${user!.id}`,
    },
    Mutation: {
        getReferralMoney: async (_0, _1, { user, repositories }) => {
            const newUser = await repositories.users.getReferralMoney(user!.id);

            return newUser.refMoney;
        },
    },
    URL: GraphQLURL,
    DateTime: GraphQLDateTime,
};
