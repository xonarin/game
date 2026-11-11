import { GraphQLDateTime } from 'graphql-scalars';
import { IRules } from 'graphql-shield';

import { ApolloContext } from '../../../interfaces/apollo';
import { database } from '../../database';
import { PaymentStatus } from '../../models/UserPayment';
import { WithdrawStatus } from '../../models/UserWithdraw';
import { UserError } from '../../../utils/errors';
import { getOnline } from '../../../services/LiveData/LiveDataStorage';
import { isValidOrigin } from '../../repositories/authClients';
import { isAdmin } from '../rules';

const num = (value: number | null | undefined): number => value || 0;

/**
 * Every admin field requires an authenticated Admin. Listed explicitly (not a `'*'` wildcard)
 * because these fields live on the shared game Query/Mutation, so a wildcard would gate the
 * whole player API too.
 */
export const rules: IRules = {
    Query: {
        adminMe: isAdmin,
        adminUsers: isAdmin,
        adminUser: isAdmin,
        adminSettings: isAdmin,
        adminDashboard: isAdmin,
        adminAuthClients: isAdmin,
    },
    Mutation: {
        adminAdjustBalance: isAdmin,
        adminUpdateSetting: isAdmin,
        adminAddAuthClient: isAdmin,
        adminSetAuthClientEnabled: isAdmin,
        adminSetAuthClientSecret: isAdmin,
        adminRemoveAuthClient: isAdmin,
    },
};

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
            const { rows, count } = await repositories.users.adminListUsers(search ?? undefined, safeLimit, safeOffset);
            return { items: rows, total: count };
        },

        adminUser: (_0: unknown, { id }: { id: string }, { repositories }: ApolloContext) =>
            repositories.users.getUserById(id),

        adminSettings: (_0: unknown, _1: unknown, { repositories }: ApolloContext) =>
            repositories.settings.getAllSettings(),

        adminAuthClients: (_0: unknown, _1: unknown, { repositories }: ApolloContext) =>
            repositories.authClients.listClients(),

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

            const updated = await repositories.users.adminAdjustMoney(userId, amount);

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

        adminAddAuthClient: async (
            _0: unknown,
            { origin, label, secret }: { origin: string; label?: string; secret?: string },
            { user, repositories }: ApolloContext,
        ) => {
            // Reject anything that is not a plain http(s) origin (no path/query) — the allowlist
            // must not become an open-redirect target.
            if (!isValidOrigin(origin)) {
                throw new UserError('INVALID_ORIGIN');
            }
            const client = await repositories.authClients.addClient(origin, label, secret);
            await database.AdminAction.create({
                adminId: user!.id,
                action: 'addAuthClient',
                targetUserId: null,
                targetKey: client.origin,
                details: { label: label || null, hasSecret: Boolean(secret) },
            });
            return client;
        },

        adminSetAuthClientSecret: async (
            _0: unknown,
            { id, secret }: { id: string; secret?: string },
            { user, repositories }: ApolloContext,
        ) => {
            await repositories.authClients.setSecret(id, secret || null);
            await database.AdminAction.create({
                adminId: user!.id,
                action: 'setAuthClientSecret',
                targetUserId: null,
                targetKey: id,
                // Never store the secret itself in the audit — only whether one was set.
                details: { hasSecret: Boolean(secret) },
            });
            const list = await repositories.authClients.listClients();
            return list.find(c => c.id === id);
        },

        adminSetAuthClientEnabled: async (
            _0: unknown,
            { id, enabled }: { id: string; enabled: boolean },
            { user, repositories }: ApolloContext,
        ) => {
            await repositories.authClients.setEnabled(id, enabled);
            await database.AdminAction.create({
                adminId: user!.id,
                action: 'setAuthClientEnabled',
                targetUserId: null,
                targetKey: id,
                details: { enabled },
            });
            const list = await repositories.authClients.listClients();
            return list.find(c => c.id === id);
        },

        adminRemoveAuthClient: async (
            _0: unknown,
            { id }: { id: string },
            { user, repositories }: ApolloContext,
        ) => {
            await repositories.authClients.removeClient(id);
            await database.AdminAction.create({
                adminId: user!.id,
                action: 'removeAuthClient',
                targetUserId: null,
                targetKey: id,
                details: {},
            });
            return true;
        },
    },
};
