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
    MutationDoQiwiWithdrawArgs,
    MutationDoWithdrawArgs,
    Payment,
    PaymentMethod,
    PaymentStatus,
    QiwiLimit,
    QiwiLimitInterval,
    QiwiWithdrawStats,
    Query,
    Withdraw,
    WithdrawMethod,
    WithdrawStatus,
} from '../../../__generated__/graphql';
import { PaymentMethod as PaymentMethodBackend } from '../../models/PaymentMethod';
import { repositories } from '../../database';
import { WithdrawMethod as WithdrawMethodBackend } from '../../models/WithdrawMethod';
import { isAdmin, isAuth } from '../rules';
import { UserError } from '../../../utils/errors';
import { md5Hash } from '../../../utils/crypto';
import config from '../../../config';
import { PaymentStatus as UserPaymentStatus, UserPayment } from '../../models/UserPayment';
import { UserWithdraw, WithdrawStatus as WithdrawStatusBackend } from '../../models/UserWithdraw';
import {
    qiwiCreateBill,
    qiwiDoWithdraw,
    qiwiFetchBalance,
    qiwiFetchMonthlyTurnover,
    qiwiFetchRestrictions,
    QiwiLimit as QiwiLimitBackend,
} from '../../../utils/qiwi';

type QueryType = Pick<
    Query,
    | 'availablePaymentMethods'
    | 'availableWithdrawMethods'
    | 'payments'
    | 'withdraws'
    | 'payedTotal'
    | 'qiwiWithdrawStats'
>;
type MutationType = Pick<Mutation, 'doDeposit' | 'doWithdraw' | 'cancelWithdraw' | 'doQiwiWithdraw'>;

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

type QiwiWithdrawStatsType = Pick<QiwiWithdrawStats, 'turnover' | 'restrictions' | 'balance'>;
type QiwiLimitType = Pick<QiwiLimit, 'type' | 'currency' | 'rest' | 'max' | 'spent' | 'interval'>;
type QiwiLimitIntervalType = Pick<QiwiLimitInterval, 'dateFrom' | 'dateTill'>;

interface QiwiWithdrawStatsParent {
    turnover?: QiwiLimitBackend;
    restrictions?: string[];
    balance?: number;
}

interface QueryMapping {
    readonly availablePaymentMethods: Resolver<PaymentMethodBackend[]>;
    readonly availableWithdrawMethods: Resolver<WithdrawMethodBackend[]>;
    readonly payments: Resolver<UserPayment[]>;
    readonly withdraws: Resolver<UserWithdraw[]>;
    readonly payedTotal: Resolver<number>;
    readonly qiwiWithdrawStats: Resolver<QiwiWithdrawStatsParent>;
}

interface MutationMapping {
    readonly doDeposit: Resolver<string, MutationDoDepositArgs>;
    readonly doWithdraw: Resolver<UserWithdraw, MutationDoWithdrawArgs>;
    readonly cancelWithdraw: Resolver<UserWithdraw, MutationCancelWithdrawArgs>;
    readonly doQiwiWithdraw: Resolver<string, MutationDoQiwiWithdrawArgs>;
}

type PaymentsResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        Mutation: TypeResolvers<MutationType, MutationMapping>;
        PaymentMethod: TypeResolvers<PaymentMethodType, {}, PaymentMethodBackend>;
        WithdrawMethod: TypeResolvers<WithdrawMethodType, {}, WithdrawMethodBackend>;
        Payment: TypeResolvers<PaymentType, {}, UserPayment>;
        Withdraw: TypeResolvers<WithdrawType, {}, UserWithdraw>;
        QiwiWithdrawStats: TypeResolvers<QiwiWithdrawStatsType, {}, QiwiWithdrawStatsParent>;
        QiwiLimit: TypeResolvers<QiwiLimitType, {}, QiwiLimitBackend>;
        QiwiLimitInterval: TypeResolvers<QiwiLimitIntervalType, {}, QiwiLimitBackend['interval']>;
        DateTime: GraphQLScalarType;
        URL: GraphQLScalarType;
    },
    ApolloContext
>;

export const rules: IRules = {
    Query: {
        payments: isAuth,
        withdraws: isAuth,
        qiwiWithdrawStats: isAdmin,
    },
    Mutation: {
        doDeposit: isAuth,
        doWithdraw: isAuth,
        cancelWithdraw: isAuth,
        doQiwiWithdraw: isAdmin,
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

        qiwiWithdrawStats: async () => ({
            turnover: await qiwiFetchMonthlyTurnover(),
            restrictions: await qiwiFetchRestrictions(),
            balance: await qiwiFetchBalance(),
        }),
    },
    Mutation: {
        doDeposit: async (_0, { amount, method }, { user }) => {
            const paymentMethod = await repositories.payments.getPaymentMethodByIdStrict(method);

            if (!paymentMethod.enabled) {
                throw new UserError('NO_PAYMENT_METHOD');
            }

            if (amount < paymentMethod.minAmount || amount > paymentMethod.maxAmount) {
                throw new UserError('BAD_AMOUNT');
            }

            const paymentId = await repositories.payments.createPayment(user!.id, paymentMethod.id, amount);

            if (paymentMethod.id === '777') {
                const a = await qiwiFetchRestrictions();
                if (a === undefined || a.length !== 0) {
                    throw new UserError('QIWI_DEPOSIT_INACTIVE');
                }

                const link = await qiwiCreateBill(paymentId, amount);
                return config.auth.qiwi.mediatorLink(`${link}&successUrl=${encodeURIComponent('https://willy.bet')}`);
            }

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
        doQiwiWithdraw: (_0, { amount, method, purse }, { user }) =>
            qiwiDoWithdraw(
                amount,
                method,
                {
                    account: purse.account,
                    remName: purse.remName ?? undefined,
                    remNameF: purse.remNameF ?? undefined,
                    recAddress: purse.recAddress ?? undefined,
                    recCity: purse.recCity ?? undefined,
                    recCountry: purse.recCountry ?? undefined,
                    regName: purse.regName ?? undefined,
                    regNameF: purse.regNameF ?? undefined,
                },
                user!.id,
            ),
    },
    Payment: {
        method: parent => repositories.payments.getPaymentMethodById(parent.methodId),
        amount: parent => parent.sum - (parent.sum * parent.commission) / 100,
        status: parent => (parent.status as string) as PaymentStatus,
    },
    Withdraw: {
        method: parent => repositories.payments.getWithdrawMethodByIdStrict(parent.methodId),
        amount: parent => parent.sum,
        status: parent => (parent.status as string) as WithdrawStatus,
    },
    DateTime: GraphQLDateTime,
    URL: GraphQLURL,
};
