import { GraphQLURL } from 'graphql-scalars';
import { GraphQLScalarType } from 'graphql';
import { and, IRules } from 'graphql-shield';
import * as queryString from 'querystring';

import { Resolver, Resolvers, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import { Query, PaymentMethod, Mutation, MutationMakeDepositArgs } from '../../../__generated__/graphql';
import { PaymentMethod as PaymentMethodBackend } from '../../models/PaymentMethod';
import { repositories } from '../../database';
import { WithdrawMethod } from '../../models/WithdrawMethod';
import { isAuth } from '../rules';
import { UserError } from '../../../utils/errors';
import { md5Hash } from '../../../utils/crypto';
import config from '../../../config';

type QueryType = Pick<Query, 'availablePaymentMethods' | 'availableWithdrawMethods'>;
type MutationType = Pick<Mutation, 'makeDeposit'>;
type PaymentMethodType = Pick<
    PaymentMethod,
    'id' | 'name' | 'avatar' | 'commission' | 'minAmount' | 'maxAmount' | 'enabled'
>;

interface QueryMapping {
    readonly availablePaymentMethods: Resolver<PaymentMethodBackend[]>;
    readonly availableWithdrawMethods: Resolver<WithdrawMethod[]>;
}

interface MutationMapping {
    makeDeposit: Resolver<string, MutationMakeDepositArgs>;
}

type PaymentsResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        Mutation: TypeResolvers<MutationType, MutationMapping>;
        PaymentMethod: TypeResolvers<PaymentMethodType, {}, PaymentMethodBackend>;
        URL: GraphQLScalarType;
    },
    ApolloContext
>;

export const rules: IRules = {
    Mutation: {
        makeDeposit: and(isAuth),
    },
};

export const resolvers: PaymentsResolvers = {
    Query: {
        availablePaymentMethods: () => repositories.payments.getAvailablePaymentMethods(),
        availableWithdrawMethods: () => repositories.payments.getAvailableWithdrawMethods(),
    },
    Mutation: {
        makeDeposit: async (_0, { amount, method }, { user }) => {
            const paymentMethod = await repositories.payments.getPaymentMethodByIdStrict(method);

            if (!paymentMethod.enabled) {
                throw new UserError('NO_PAYMENT_METHOD');
            }

            if (amount < paymentMethod.minAmount || amount > paymentMethod.maxAmount) {
                throw new UserError('BAD_AMOUNT');
            }

            const paymentId = await repositories.payments.createPayment(user!.id, paymentMethod.id, amount);
            const sign = md5Hash(`${config.auth.fk.merchantId}:${amount}:${config.auth.fk.secret}:${paymentId}`);

            return `https://www.free-kassa.ru/merchant/cash.php?${queryString.encode({
                m: config.auth.fk.merchantId,
                oa: amount,
                o: paymentId,
                s: sign,
            })}`;
        },
    },
    URL: GraphQLURL,
};
