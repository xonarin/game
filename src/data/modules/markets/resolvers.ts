import { IRules, or } from 'graphql-shield';

import { ApolloContext } from '../../../interfaces/apollo';
import { database } from '../../database';
import { Market } from '../../models/Market';
import { UnmatchedName } from '../../models/UnmatchedName';
import { UserError } from '../../../utils/errors';
import { disableMarket } from '../../../services/marketPrices/service';
import { isAdmin, isAdminService } from '../rules';

// ── RULES ─────────────────────────────────────────────────────────────────────

// Чтение — админ или сервер админки (крон, синхронизация); изменение — только админ (попадает в AdminAction)
const isAdminOrAdminService = or(isAdmin, isAdminService);

export const rules: IRules = {
    Query: {
        markets: isAdminOrAdminService,
        market: isAdminOrAdminService,
        unmatchedNames: isAdminOrAdminService,
        itemOffers: isAdminOrAdminService,
    },
    Mutation: {
        updateMarket: isAdmin,
        setUnmatchedIgnored: isAdmin,
    },
};

// ── VALIDATION ────────────────────────────────────────────────────────────────

const MAX_SETTINGS_LENGTH = 10_000;
const PRIORITY_LIMIT = 1_000_000;
// Доля 0…1 с точностью до сотых: "0.7", "0.70", "1"
const RATIO_RE = /^(0(\.\d{1,2})?|1(\.0{1,2})?)$/;

const fieldError = (field: string, message: string) => new UserError(message, { field });

const parsePriority = (value: number): number => {
    if (!Number.isInteger(value) || Math.abs(value) > PRIORITY_LIMIT) {
        throw fieldError('priority', `priority: целое от -${PRIORITY_LIMIT} до ${PRIORITY_LIMIT}`);
    }
    return value;
};

const parseRatio = (value: string): string => {
    const raw = value.trim();
    if (!RATIO_RE.test(raw)) {
        throw fieldError('minRowsRatio', `minRowsRatio: доля от 0 до 1 с точностью до сотых, например 0.70`);
    }
    return Number(raw).toFixed(2);
};

const parseSettings = (value: string): Record<string, unknown> => {
    if (value.length > MAX_SETTINGS_LENGTH) {
        throw fieldError('settings', `settings: не длиннее ${MAX_SETTINGS_LENGTH} символов`);
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(value);
    } catch {
        throw fieldError('settings', 'settings: некорректный JSON');
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw fieldError('settings', 'settings: ожидается JSON-объект {…}');
    }
    return parsed as Record<string, unknown>;
};

const requireMarket = async (code: string, { repositories }: ApolloContext, field = 'code'): Promise<Market> => {
    const market = await repositories.markets.getByCode(code);
    if (!market) {
        throw fieldError(field, `Магазин «${code}» не найден`);
    }
    return market;
};

const snapshot = (market: Market) => ({
    enabled: market.enabled,
    priority: market.priority,
    minRowsRatio: market.minRowsRatio,
    settings: market.settings,
});

const unmatchedView = (row: UnmatchedName, marketCode: string) => ({
    marketCode,
    marketHashName: row.marketHashName,
    lastPrice: row.lastPrice,
    firstSeen: row.firstSeen,
    lastSeen: row.lastSeen,
    ignored: row.ignored,
});

// ── RESOLVERS ─────────────────────────────────────────────────────────────────

export const resolvers = {
    Market: {
        settings: (market: Market) => JSON.stringify(market.settings ?? {}),
    },

    Query: {
        markets: (_0: unknown, _1: unknown, { repositories }: ApolloContext) => repositories.markets.list(),

        market: (_0: unknown, { code }: { code: string }, { repositories }: ApolloContext) =>
            repositories.markets.getByCode(code),

        unmatchedNames: async (
            _0: unknown,
            args: {
                marketCode: string;
                limit?: number | null;
                offset?: number | null;
                includeIgnored?: boolean | null;
            },
            ctx: ApolloContext,
        ) => {
            const market = await requireMarket(args.marketCode, ctx, 'marketCode');
            const limit = Math.min(Math.max(args.limit ?? 50, 1), 500);
            const offset = Math.max(args.offset ?? 0, 0);
            const page = await ctx.repositories.markets.listUnmatched(
                market.id,
                limit,
                offset,
                args.includeIgnored ?? false,
            );
            return { total: page.total, items: page.items.map(row => unmatchedView(row, market.code)) };
        },

        itemOffers: (_0: unknown, { itemId }: { itemId: string }, { repositories }: ApolloContext) =>
            repositories.marketPrices.offers(itemId),
    },

    Mutation: {
        updateMarket: async (
            _0: unknown,
            args: {
                code: string;
                enabled?: boolean | null;
                priority?: number | null;
                minRowsRatio?: string | null;
                settings?: string | null;
            },
            ctx: ApolloContext,
        ) => {
            const before = await requireMarket(args.code, ctx);
            const prev = snapshot(before);

            // Сначала проверка всех полей: при ошибке ничего не меняется
            const values: { priority?: number; minRowsRatio?: string; settings?: Record<string, unknown> } = {};
            if (args.priority !== undefined && args.priority !== null) values.priority = parsePriority(args.priority);
            if (args.minRowsRatio !== undefined && args.minRowsRatio !== null) {
                values.minRowsRatio = parseRatio(args.minRowsRatio);
            }
            if (args.settings !== undefined && args.settings !== null) values.settings = parseSettings(args.settings);

            if (Object.keys(values).length > 0) {
                await before.update(values);
            }

            // Выключение — флаг + удаление цен + пересчёт одной транзакцией; включение — только флаг
            if (args.enabled === false && before.enabled) {
                await disableMarket(before.code);
            } else if (args.enabled === true && !before.enabled) {
                await before.update({ enabled: true });
            }

            const after = (await ctx.repositories.markets.getByCode(args.code))!;
            await database.AdminAction.create({
                adminId: ctx.user!.id,
                action: 'updateMarket',
                targetUserId: null,
                targetKey: after.code,
                details: { before: prev, after: snapshot(after) },
            });
            return after;
        },

        setUnmatchedIgnored: async (
            _0: unknown,
            args: { marketCode: string; marketHashName: string; ignored: boolean },
            ctx: ApolloContext,
        ) => {
            const market = await requireMarket(args.marketCode, ctx, 'marketCode');
            const row = await ctx.repositories.markets.setUnmatchedIgnored(
                market.id,
                args.marketHashName,
                args.ignored,
            );
            if (!row) {
                throw fieldError(
                    'marketHashName',
                    `У магазина ${market.code} нет несовпавшего имени «${args.marketHashName}»`,
                );
            }
            return unmatchedView(row, market.code);
        },
    },
};
