import cron from 'node-cron';
import { IRules, or } from 'graphql-shield';
import { IANAZone } from 'luxon';

import { ApolloContext } from '../../../interfaces/apollo';
import { database } from '../../database';
import { SyncRunKind } from '../../models/SyncRun';
import { UserError } from '../../../utils/errors';
import { CATALOG_SOURCE_SETTING, checkCatalogSourceUrl } from '../../../services/catalogSync/sourceUrl';
import { isAdmin, isAdminService } from '../rules';

// ── RULES ─────────────────────────────────────────────────────────────────────

// Чтение — админ или сервер админки (крон); изменение — только админ (попадает в AdminAction)
const isAdminOrAdminService = or(isAdmin, isAdminService);

export const rules: IRules = {
    Query: {
        cronJobs: isAdminOrAdminService,
        cronJob: isAdminOrAdminService,
        syncRuns: isAdminOrAdminService,
        catalogStats: isAdminOrAdminService,
        catalogSourceUrl: isAdminOrAdminService,
    },
    Mutation: {
        updateCronJob: isAdmin,
    },
};

// ── VALIDATION ────────────────────────────────────────────────────────────────

const fieldError = (field: string, message: string) => new UserError(message, { field });

/** 5-полевое cron-выражение; лишние пробелы схлопываются. */
const normalizeCron = (value: string): string => {
    const fields = value.trim().split(/\s+/).filter(Boolean);
    if (fields.length !== 5) {
        throw fieldError(
            'cronExpression',
            `Нужно 5 полей «минута час день месяц день_недели», получено ${fields.length}. Пример: 0 4 * * 1`,
        );
    }

    const normalized = fields.join(' ');
    if (normalized.length > 128 || !cron.validate(normalized)) {
        throw fieldError(
            'cronExpression',
            `Неверное cron-выражение «${normalized}»: проверьте диапазоны (минута 0–59, час 0–23, ` +
                'день 1–31, месяц 1–12, день недели 0–7) и синтаксис (* , - /)',
        );
    }
    return normalized;
};

/** IANA-таймзона в каноническом написании (utc -> UTC). */
const normalizeTimezone = (value: string): string => {
    const zone = value.trim();
    if (!zone || zone.length > 64 || !IANAZone.isValidZone(zone)) {
        throw fieldError('timezone', `Неизвестная таймзона «${zone}». Нужно имя IANA, например Asia/Tashkent или UTC`);
    }
    return new Intl.DateTimeFormat('en-US', { timeZone: zone }).resolvedOptions().timeZone;
};

// ── RESOLVERS ─────────────────────────────────────────────────────────────────

export const resolvers = {
    Query: {
        cronJobs: (_0: unknown, _1: unknown, { repositories }: ApolloContext) => repositories.cronJobs.list(),

        cronJob: (_0: unknown, { key }: { key: string }, { repositories }: ApolloContext) =>
            repositories.cronJobs.get(key),

        syncRuns: (
            _0: unknown,
            { kind, limit }: { kind?: string | null; limit?: number | null },
            { repositories }: ApolloContext,
        ) => repositories.syncRuns.list(kind || SyncRunKind.Catalog, Math.min(Math.max(limit ?? 20, 1), 100)),

        catalogStats: async (_0: unknown, _1: unknown, { repositories }: ApolloContext) => {
            const [total, byType, byCategory, lastSuccessfulImportAt] = await Promise.all([
                repositories.catalog.count(),
                repositories.catalog.countByType(),
                repositories.catalog.countSkinsByCategory(),
                repositories.syncRuns.lastSuccessfulAt(SyncRunKind.Catalog),
            ]);
            return { total, byType, byCategory, lastSuccessfulImportAt };
        },

        // Проверяется и при чтении: значение могли поменять в БД в обход админки или сузить CATALOG_SOURCE_HOSTS
        catalogSourceUrl: async (_0: unknown, _1: unknown, { repositories }: ApolloContext) => {
            const url = (await repositories.settings.getSettingAsString(CATALOG_SOURCE_SETTING)).trim();
            const problem = checkCatalogSourceUrl(url);
            if (problem) {
                throw new UserError(`Настройка ${CATALOG_SOURCE_SETTING}: ${problem}`);
            }
            return url;
        },
    },

    Mutation: {
        updateCronJob: async (
            _0: unknown,
            args: { key: string; cronExpression: string; timezone: string; enabled: boolean },
            { user, repositories }: ApolloContext,
        ) => {
            const before = await repositories.cronJobs.get(args.key);
            if (!before) {
                throw fieldError('key', `Расписание «${args.key}» не найдено`);
            }

            // Сначала проверка: при ошибке старое расписание остаётся как было
            const values = {
                cronExpression: normalizeCron(args.cronExpression),
                timezone: normalizeTimezone(args.timezone),
                enabled: args.enabled,
            };
            const prev = {
                cronExpression: before.cronExpression,
                timezone: before.timezone,
                enabled: before.enabled,
            };

            const updated = await repositories.cronJobs.update(args.key, values);

            await database.AdminAction.create({
                adminId: user!.id,
                action: 'updateCronJob',
                targetUserId: null,
                targetKey: args.key,
                details: { before: prev, after: values },
            });

            return updated;
        },
    },
};
