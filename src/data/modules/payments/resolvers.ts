import { GraphQLURL } from 'graphql-scalars';
import { GraphQLScalarType } from 'graphql';

import { Resolver, Resolvers, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import { Query, PaymentMethod } from '../../../__generated__/graphql';
import { PaymentMethod as PaymentMethodBackend } from '../../models/PaymentMethod';
import { repositories } from '../../database';
import { WithdrawMethod } from '../../models/WithdrawMethod';

type QueryType = Pick<Query, 'availablePaymentMethods' | 'availableWithdrawMethods'>;
type PaymentMethodType = Pick<
    PaymentMethod,
    'id' | 'name' | 'avatar' | 'commission' | 'minAmount' | 'maxAmount' | 'enabled'
>;

interface QueryMapping {
    readonly availablePaymentMethods: Resolver<PaymentMethodBackend[]>;
    readonly availableWithdrawMethods: Resolver<WithdrawMethod[]>;
}

type PaymentsResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        PaymentMethod: TypeResolvers<PaymentMethodType, {}, PaymentMethodBackend>;
        URL: GraphQLScalarType;
    },
    ApolloContext
>;

export const resolvers: PaymentsResolvers = {
    Query: {
        availablePaymentMethods: () => repositories.payments.getAvailablePaymentMethods(),
        availableWithdrawMethods: () => repositories.payments.getAvailableWithdrawMethods(),
    },
    URL: GraphQLURL,
};
