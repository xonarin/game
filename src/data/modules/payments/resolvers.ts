import { GraphQLDateTime, GraphQLURL } from 'graphql-scalars';
import { GraphQLScalarType } from 'graphql';
import { IRules } from 'graphql-shield';
import * as queryString from 'querystring';

import { Resolver, Resolvers, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import {
    Query,
    PaymentMethod,
    Mutation,
    MutationMakeDepositArgs,
    WithdrawMethod,
    Payment,
    Withdraw,
} from '../../../__generated__/graphql';
import { PaymentMethod as PaymentMethodBackend } from '../../models/PaymentMethod';
import { repositories } from '../../database';
import { WithdrawMethod as WithdrawMethodBackend } from '../../models/WithdrawMethod';
import { isAuth } from '../rules';
import { UserError } from '../../../utils/errors';
import { md5Hash } from '../../../utils/crypto';
import config from '../../../config';
import { UserPayment } from '../../models/UserPayment';
import { UserWithdraw } from '../../models/UserWithdraw';

type QueryType = Pick<Query, 'availablePaymentMethods' | 'availableWithdrawMethods' | 'payments' | 'withdraws'>;
type MutationType = Pick<Mutation, 'makeDeposit'>;

type PaymentMethodType = Pick<
    PaymentMethod,
    'id' | 'name' | 'avatar' | 'commission' | 'minAmount' | 'maxAmount' | 'enabled'
>;

type WithdrawMethodType = Pick<
    WithdrawMethod,
    'id' | 'name' | 'avatar' | 'commission' | 'minAmount' | 'maxAmount' | 'enabled'
>;

type PaymentType = Pick<Payment, 'id' | 'method' | 'amount' | 'status' | 'createdAt'>;
type WithdrawType = Pick<Withdraw, 'id' | 'method' | 'amount' | 'status' | 'createdAt'>;

interface QueryMapping {
    readonly availablePaymentMethods: Resolver<PaymentMethodBackend[]>;
    readonly availableWithdrawMethods: Resolver<WithdrawMethodBackend[]>;
}

interface MutationMapping {
    makeDeposit: Resolver<string, MutationMakeDepositArgs>;
}

type PaymentsResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        Mutation: TypeResolvers<MutationType, MutationMapping>;
        PaymentMethod: TypeResolvers<PaymentMethodType, {}, PaymentMethodBackend>;
        WithdrawMethod: TypeResolvers<WithdrawMethodType, {}, WithdrawMethodBackend>;
        Payment: TypeResolvers<PaymentType, {}, UserPayment>;
        Withdraw: TypeResolvers<WithdrawType, {}, UserWithdraw>;
        DateTime: GraphQLScalarType;
        URL: GraphQLScalarType;
    },
    ApolloContext
>;

export const rules: IRules = {
    Query: {
        payments: isAuth,
        withdraws: isAuth,
    },
    Mutation: {
        makeDeposit: isAuth,
    },
};

export const resolvers: PaymentsResolvers = {
    Query: {
        availablePaymentMethods: () => repositories.payments.getAvailablePaymentMethods(),
        availableWithdrawMethods: () => repositories.payments.getAvailableWithdrawMethods(),

        payments: (_0, _1, { user }) => repositories.payments.getPaymentsByUserId(user!.id),
        withdraws: (_0, _1, { user }) => repositories.payments.getWithdrawsByUserId(user!.id),
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
    Payment: {
        method: parent => repositories.payments.getPaymentMethodById(parent.methodId),
        amount: parent => parent.sum,
    },
    Withdraw: {
        method: parent => repositories.payments.getWithdrawMethodById(parent.methodId),
        amount: parent => parent.sum,
    },
    DateTime: GraphQLDateTime,
    URL: GraphQLURL,
};
