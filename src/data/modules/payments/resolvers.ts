import { GraphQLDateTime, GraphQLURL } from 'graphql-scalars';
import { GraphQLScalarType } from 'graphql';
import { IRules } from 'graphql-shield';
import * as queryString from 'querystring';

import { Resolver, Resolvers, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import {
    Mutation,
    MutationCancelWithdrawArgs,
    MutationDoDepositArgs,
    MutationDoWithdrawArgs,
    Payment,
    PaymentMethod,
    PaymentStatus,
    Query,
    Withdraw,
    WithdrawMethod,
    WithdrawStatus,
} from '../../../__generated__/graphql';
import { PaymentMethod as PaymentMethodBackend } from '../../models/PaymentMethod';
import { repositories } from '../../database';
import { WithdrawMethod as WithdrawMethodBackend } from '../../models/WithdrawMethod';
import { isAuth } from '../rules';
import { UserError } from '../../../utils/errors';
import { md5Hash } from '../../../utils/crypto';
import config, { isFreeKassaEnabled } from '../../../config';
import { PaymentStatus as UserPaymentStatus, UserPayment } from '../../models/UserPayment';
import { UserWithdraw, WithdrawStatus as WithdrawStatusBackend } from '../../models/UserWithdraw';

type QueryType = Pick<
    Query,
    'availablePaymentMethods' | 'availableWithdrawMethods' | 'payments' | 'withdraws' | 'payedTotal'
>;
type MutationType = Pick<Mutation, 'doDeposit' | 'doWithdraw' | 'cancelWithdraw'>;

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
    readonly payments: Resolver<UserPayment[]>;
    readonly withdraws: Resolver<UserWithdraw[]>;
    readonly payedTotal: Resolver<number>;
}

interface MutationMapping {
    readonly doDeposit: Resolver<string, MutationDoDepositArgs>;
    readonly doWithdraw: Resolver<UserWithdraw, MutationDoWithdrawArgs>;
    readonly cancelWithdraw: Resolver<UserWithdraw, MutationCancelWithdrawArgs>;
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
        doDeposit: isAuth,
        doWithdraw: isAuth,
        cancelWithdraw: isAuth,
    },
};

export const resolvers: PaymentsResolvers = {
    Query: {
        availablePaymentMethods: () => repositories.payments.getAvailablePaymentMethods(),
        availableWithdrawMethods: () => repositories.payments.getAvailableWithdrawMethods(),

        payments: (_0, _1, { user }) => repositories.payments.getPaymentsByUserId(user!.id, UserPaymentStatus.FINISHED),
        withdraws: (_0, _1, { user }) => repositories.payments.getWithdrawsByUserId(user!.id),

        payedTotal: async () => {
            const withdraws = await repositories.payments.getWithdrawsByStatus(WithdrawStatusBackend.SUCCESS);

            return withdraws.reduce((sum, withdraw) => sum + withdraw.sum, 0);
        },
    },
    Mutation: {
        doDeposit: async (_0, { amount, method }, { user }) => {
            const paymentMethod = await repositories.payments.getPaymentMethodByIdStrict(method);

            if (!paymentMethod.enabled || !isFreeKassaEnabled()) {
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
        doWithdraw: async (_0, { amount, method, purse }, { user }) => {
            const paymentMethod = await repositories.payments.getWithdrawMethodByIdStrict(method);

            if (!paymentMethod.enabled) {
                throw new UserError('NO_WITHDRAW_METHOD');
            }

            if (amount < paymentMethod.minAmount || amount > paymentMethod.maxAmount) {
                throw new UserError('BAD_AMOUNT');
            }

            return repositories.payments.createWithdraw(user!.id, method, purse, amount);
        },
        cancelWithdraw: (_0, { id }, { user }) => repositories.payments.cancelWithdraw(id, user!.id),
    },
    Payment: {
        method: parent => repositories.payments.getPaymentMethodById(parent.methodId),
        amount: parent => parent.sum - (parent.sum * parent.commission) / 100,
        status: parent => parent.status as string as PaymentStatus,
    },
    Withdraw: {
        method: parent => repositories.payments.getWithdrawMethodByIdStrict(parent.methodId),
        amount: parent => parent.sum,
        status: parent => parent.status as string as WithdrawStatus,
    },
    DateTime: GraphQLDateTime,
    URL: GraphQLURL,
};
