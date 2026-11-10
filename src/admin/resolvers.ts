import { GraphQLDateTime } from 'graphql-scalars';
import { allow, rule, shield } from 'graphql-shield';

import { ApolloContext } from '../interfaces/apollo';
import { database } from '../data/database';
import { User, UserRole } from '../data/models/User';
import { PaymentStatus } from '../data/models/UserPayment';
import { WithdrawStatus } from '../data/models/UserWithdraw';
import { UserError } from '../utils/errors';
import { getOnline } from '../services/LiveData/LiveDataStorage';

const isAdmin = rule({ cache: 'contextual' })((_0: unknown, _1: unknown, ctx: ApolloContext) => {
    if (!ctx.user || ctx.user.role !== UserRole.Admin) {
        return new UserError('NOT_ADMIN');
    }
    return true;
});

/** graphql-shield: every admin field requires an authenticated admin. */
export const permissions = shield(
    {
        DateTime: allow,
        AdminUser: allow,
        AdminUsersPage: allow,
        AdminSetting: allow,
        DashboardStats: allow,
        Query: { '*': isAdmin },
        Mutation: { '*': isAdmin },
    },
    { allowExternalErrors: true, fallbackError: new UserError('NOT_ADMIN') },
);

const num = (value: number | null | undefined): number => value || 0;

export const resolvers = {
    DateTime: GraphQLDateTime,

    Query: {
        adminMe: (_0: unknown, _1: unknown, { user }: ApolloContext) => user,

        adminUsers: async (
            _0: unknown,
            { search, limit, offset }: { search?: string; limit?: number; offset?: number },
            { repositories }: ApolloContext,
        ) => {
            const safeLimit = Math.min(Math.max(limit ?? 25, 1), 100);
            const safeOffset = Math.max(offset ?? 0, 0);
            const { rows, count } = await repositories.users.adminListUsers(search, safeLimit, safeOffset);
            return { items: rows, total: count };
        },

        adminUser: (_0: unknown, { id }: { id: string }, { repositories }: ApolloContext) =>
            repositories.users.getUserById(id),

        adminSettings: (_0: unknown, _1: unknown, { repositories }: ApolloContext) =>
            repositories.settings.getAllSettings(),

        adminDashboard: async () => {
            const [
                usersTotal,
                onlineNow,
                balanceTotal,
                depositsTotal,
                withdrawalsTotal,
                minesGamesTotal,
                classicGamesTotal,
            ] = await Promise.all([
                database.User.count(),
                getOnline(),
                database.User.sum('money'),
                database.UserPayment.sum('sum', { where: { status: PaymentStatus.FINISHED } }),
                database.UserWithdraw.sum('sum', { where: { status: WithdrawStatus.SUCCESS } }),
                database.MinesGame.count(),
                database.ClassicGame.count(),
            ]);

            return {
                usersTotal,
                onlineNow,
                balanceTotal: num(balanceTotal),
                depositsTotal: num(depositsTotal),
                withdrawalsTotal: num(withdrawalsTotal),
                minesGamesTotal,
                classicGamesTotal,
            };
        },
    },

    Mutation: {
        adminAdjustBalance: async (
            _0: unknown,
            { userId, amount, reason }: { userId: string; amount: number; reason?: string },
            { user, repositories }: ApolloContext,
        ) => {
            const before = await repositories.users.getUserById(userId);
            if (!before) {
                throw new UserError('NO_USER');
            }

            const updated: User = await repositories.users.adminAdjustMoney(userId, amount);

            await database.AdminAction.create({
                adminId: user!.id,
                action: 'adjustBalance',
                targetUserId: userId,
                targetKey: null,
                details: { amount, reason: reason || null, before: before.money, after: updated.money },
            });

            return updated;
        },

        adminUpdateSetting: async (
            _0: unknown,
            { name, value }: { name: string; value: string },
            { user, repositories }: ApolloContext,
        ) => {
            const current = await repositories.settings.getAllSettings();
            const prev = current.find(setting => setting.name === name);

            const result = await repositories.settings.setSetting(name, value);

            await database.AdminAction.create({
                adminId: user!.id,
                action: 'updateSetting',
                targetUserId: null,
                targetKey: name,
                details: { before: prev ? prev.value : null, after: value },
            });

            return result;
        },
    },
};
