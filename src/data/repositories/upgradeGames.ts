import { fn, col, literal, Op, WhereOptions } from 'sequelize';

import BaseRepository from './base';
import { InventoryItem } from '../models/InventoryItem';
import { Item } from '../models/Item';
import { UpgradeGame } from '../models/UpgradeGame';
import { UserError } from '../../utils/errors';
import { itemNameSearchConditions } from './catalog';
import {
    calcUpgradeWindow,
    fromCents,
    isChanceInRange,
    isUpgradeWin,
    toCents,
    toRoll,
} from '../../services/upgrade/game';

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface PlayUpgradeInput {
    betAmount: number;
    /** Свои скины в ставку (id строк инвентаря), не больше upgrade::maxBetItems. */
    betItemIds?: string[] | null;
    targetItemId: string;
    /** Множитель, который видел игрок. Сервер считает свой по ценам; расхождение — цены изменились. */
    targetMultiplier: number;
}

export type ItemsSortUPG = 'PRICE_ASC' | 'PRICE_DESC';

export interface ItemsFilterUPG {
    search?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    sort?: ItemsSortUPG | null;
    limit?: number | null;
    offset?: number | null;
}

export interface BuyItemsEntry {
    itemId: string;
    quantity: number;
}

export interface PlayUpgradeResult {
    game: UpgradeGame;
    /** Выигранный скин в инвентаре (null — проигрыш). */
    wonInventoryItem: InventoryItem | null;
}

/** Статистика апгрейда за период (админка). Суммы — в монетах; ставка включает стоимость скинов. */
export interface UpgradeStats {
    players: number;
    games: number;
    wins: number;
    losses: number;
    /** Сколько поставлено (монеты + скины). */
    betTotal: number;
    /** Сколько выдано выигрышами (цена выигранных скинов). */
    payoutTotal: number;
    /** Доход сайта: betTotal − payoutTotal. */
    profit: number;
    /** Фактический RTP: payoutTotal / betTotal; null — ставок не было. */
    rtp: number | null;
}

export interface UpgradeConfig {
    frontendCoef: number;
    minBet: number;
    maxBet: number;
    targetItemMarkup: number;
    minChance: number;
    maxChance: number;
    maxBuyUnits: number;
    maxBetItems: number;
}

// Допуск между множителем игрока и серверным (округления цен на клиенте)
const MULTIPLIER_TOLERANCE = 0.005;
const ITEMS_PAGE_LIMIT = 60;
const ITEMS_DEFAULT_LIMIT = 20;
const MAX_SEARCH_WORDS = 5;
const MAX_SEARCH_LENGTH = 100;
/** Больше скинов за одну покупку взять нельзя (сумма количеств по всем позициям). */
export const MAX_BUY_UNITS = 50;
const HISTORY_PAGE_LIMIT = 50;

/** Стоимость скина в ставке: текущая цена магазинов, а если её нет — цена при получении. */
export const inventoryItemValue = (inventoryItem: InventoryItem): number => {
    const current = inventoryItem.item?.isAvailable ? inventoryItem.item.price : null;
    return Number(current ?? inventoryItem.priceAtAcquisition);
};

// ── REPOSITORY ────────────────────────────────────────────────────────────────

class UpgradeGamesRepository extends BaseRepository {
    async getConfig(): Promise<UpgradeConfig> {
        const { settings } = this.repositories;
        const [frontendCoef, minBet, maxBet, targetItemMarkup, minChance, maxChance, maxBetItems] = await Promise.all([
            settings.getSettingAsNumber('upgrade::frontendCoef'),
            settings.getSettingAsNumber('upgrade::minBet'),
            settings.getSettingAsNumber('upgrade::maxBet'),
            settings.getSettingAsNumber('upgrade::targetItemMarkup'),
            settings.getSettingAsNumber('upgrade::minChance'),
            settings.getSettingAsNumber('upgrade::maxChance'),
            settings.getSettingAsNumber('upgrade::maxBetItems'),
        ]);
        return {
            frontendCoef,
            minBet,
            maxBet,
            targetItemMarkup,
            minChance,
            maxChance,
            maxBuyUnits: MAX_BUY_UNITS,
            maxBetItems,
        };
    }

    /** Статистика за период [from, to) (любая граница может отсутствовать). */
    async getStats(from: Date | null, to: Date | null): Promise<UpgradeStats> {
        const createdAt: Record<symbol, Date> = {};
        if (from) createdAt[Op.gte] = from;
        if (to) createdAt[Op.lt] = to;

        const [row] = (await this.db.UpgradeGame.findAll({
            attributes: [
                [fn('COUNT', col('id')), 'games'],
                [fn('COUNT', fn('DISTINCT', col('userId'))), 'players'],
                [fn('COALESCE', fn('SUM', literal('`win`')), 0), 'wins'],
                [fn('COALESCE', fn('SUM', col('betValue')), 0), 'betTotal'],
                [fn('COALESCE', fn('SUM', literal('CASE WHEN `win` THEN `targetPrice` ELSE 0 END')), 0), 'payoutTotal'],
            ],
            where: from || to ? { createdAt } : {},
            raw: true,
        })) as unknown as Array<Record<'games' | 'players' | 'wins' | 'betTotal' | 'payoutTotal', string | number>>;

        const games = Number(row.games);
        const wins = Number(row.wins);
        // Деньги — в центах, чтобы доход не получил хвост плавающей точки
        const betCents = toCents(row.betTotal);
        const payoutCents = toCents(row.payoutTotal);

        return {
            players: Number(row.players),
            games,
            wins,
            losses: games - wins,
            betTotal: fromCents(betCents),
            payoutTotal: fromCents(payoutCents),
            profit: fromCents(betCents - payoutCents),
            rtp: betCents > 0 ? payoutCents / betCents : null,
        };
    }

    /** История апгрейдов игрока, новые первыми; ставка и цель — снимки из самой игры. */
    async getHistory(userId: string, limit: number = HISTORY_PAGE_LIMIT, offset: number = 0): Promise<UpgradeGame[]> {
        return this.db.UpgradeGame.findAll({
            where: { userId },
            include: [
                { association: this.db.UpgradeGame.BetItems, include: [this.db.UpgradeGameBetItem.Item] },
                this.db.UpgradeGame.TargetItem,
            ],
            order: [['id', 'DESC']],
            limit: Math.min(Math.max(limit, 1), HISTORY_PAGE_LIMIT),
            offset: Math.max(offset, 0),
        });
    }

    /**
     * Витрина (магазин и цели апгрейда): доступные предметы — поиск по названию, цена от/до,
     * сортировка по цене, страница. total — сколько всего подходит под фильтр.
     */
    async getItems(filter: ItemsFilterUPG): Promise<{ items: Item[]; total: number }> {
        const words = (filter.search ?? '')
            .slice(0, MAX_SEARCH_LENGTH)
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, MAX_SEARCH_WORDS);

        const price: Record<symbol, number> = { [Op.gte]: Math.max(filter.minPrice ?? 0, 0.01) };
        if (filter.maxPrice !== null && filter.maxPrice !== undefined) {
            price[Op.lte] = filter.maxPrice;
        }
        const conditions: WhereOptions[] = [{ isAvailable: true, price }, ...itemNameSearchConditions(words)];
        const direction = filter.sort === 'PRICE_DESC' ? 'DESC' : 'ASC';

        const { rows, count } = await this.db.Item.findAndCountAll({
            where: { [Op.and]: conditions },
            order: [
                ['price', direction],
                ['id', direction],
            ],
            limit: Math.min(Math.max(filter.limit ?? ITEMS_DEFAULT_LIMIT, 1), ITEMS_PAGE_LIMIT),
            offset: Math.max(filter.offset ?? 0, 0),
        });
        return { items: rows, total: count };
    }

    /** Предмет, если он в продаже (есть цена у магазинов), иначе null. */
    async getAvailableItem(id: string): Promise<Item | null> {
        const item = await this.db.Item.findByPk(id);
        return item && item.isAvailable && item.price !== null ? item : null;
    }

    /**
     * Покупка скинов в магазине за монеты (1 монета = 1 USD) одной транзакцией: все позиции или ничего.
     * Количество каждой — целое ≥ 1, всего не больше MAX_BUY_UNITS; цены — текущие на момент покупки.
     */
    async buyItems(userId: string, entries: BuyItemsEntry[]): Promise<InventoryItem[]> {
        // Одинаковые позиции складываем
        const quantities = new Map<string, number>();
        entries.forEach(({ itemId, quantity }) => {
            if (!Number.isInteger(quantity) || quantity < 1) {
                throw new UserError('SHOP_INVALID_QUANTITY');
            }
            quantities.set(itemId, (quantities.get(itemId) ?? 0) + quantity);
        });

        const totalUnits = [...quantities.values()].reduce((sum, quantity) => sum + quantity, 0);
        if (totalUnits === 0) {
            throw new UserError('SHOP_EMPTY_CART');
        }
        if (totalUnits > MAX_BUY_UNITS) {
            throw new UserError('SHOP_TOO_MANY_ITEMS', { max: MAX_BUY_UNITS });
        }

        return this.db.sequelize.transaction(async transaction => {
            const items = await this.db.Item.findAll({
                where: { id: { [Op.in]: [...quantities.keys()] } },
                transaction,
            });
            if (items.length !== quantities.size || items.some(item => !item.isAvailable || item.price === null)) {
                throw new UserError('UPGRADE_ITEM_NOT_AVAILABLE');
            }

            const purchase = items.map(item => ({ item, quantity: quantities.get(item.id)! }));
            const totalCents = purchase.reduce((sum, { item, quantity }) => sum + toCents(item.price!) * quantity, 0);

            await this.repositories.users.withdrawMoney(userId, fromCents(totalCents), transaction);
            return this.repositories.inventory.addMany(userId, purchase, transaction);
        });
    }

    /**
     * Апгрейд одной транзакцией: скин ставки уходит из инвентаря → списание монет → бросок →
     * выдача выигрыша → запись игры. Любая ошибка откатывает всё: скин и монеты остаются у игрока.
     * Исход зависит только от provably fair броска и окна, посчитанного до него.
     */
    async play(userId: string, input: PlayUpgradeInput): Promise<PlayUpgradeResult> {
        const config = await this.getConfig();
        const betAmountCents = toCents(input.betAmount);

        if (betAmountCents < 0 || Math.abs(input.betAmount * 100 - betAmountCents) > 1e-6) {
            throw new UserError('UPGRADE_INVALID_BET');
        }

        const betItemIds = input.betItemIds ?? [];
        if (new Set(betItemIds).size !== betItemIds.length) {
            throw new UserError('UPGRADE_BET_ITEM_NOT_FOUND');
        }
        if (betItemIds.length > config.maxBetItems) {
            throw new UserError('UPGRADE_TOO_MANY_BET_ITEMS', { max: config.maxBetItems });
        }

        return this.db.sequelize.transaction(async transaction => {
            // Скины ставки: только свои и свободные (не на выводе, не в другой игре). Строки удаляются сразу:
            // параллельный запрос с теми же скинами ждёт блокировку и уже не найдёт их. Блокируем по
            // возрастанию id — две игры с пересекающимися наборами не возьмут блокировки встречно (deadlock)
            // Строго по очереди (не Promise.all): иначе порядок взятия блокировок не гарантирован
            const betItems = await [...betItemIds]
                .sort((a, b) => Number(a) - Number(b))
                .reduce<Promise<InventoryItem[]>>(
                    async (taken, id) => [
                        ...(await taken),
                        await this.repositories.inventory.takeForGame(userId, id, transaction),
                    ],
                    Promise.resolve([]),
                );
            const betItemsValueCents = betItems.reduce((sum, row) => sum + toCents(inventoryItemValue(row)), 0);

            const betValueCents = betAmountCents + betItemsValueCents;
            if (betValueCents <= 0) {
                throw new UserError('UPGRADE_INVALID_BET');
            }
            if (betValueCents < toCents(config.minBet) || betValueCents > toCents(config.maxBet)) {
                throw new UserError('UPGRADE_BET_OUT_OF_RANGE', { minBet: config.minBet, maxBet: config.maxBet });
            }

            // Цель: любой доступный предмет; пределы задаёт шанс (minChance … maxChance) ниже
            const target = await this.db.Item.findByPk(input.targetItemId, { transaction });
            if (!target || !target.isAvailable || target.price === null) {
                throw new UserError('UPGRADE_ITEM_NOT_AVAILABLE');
            }
            const targetPriceCents = toCents(target.price);

            // Сначала — те ли цены видел игрок: множитель по текущим ценам скина и цели против присланного.
            // Цены обновляются синхронизацией маркетов; со старыми ценами игрок видел другой шанс, и
            // «шанс вне пределов» ввёл бы его в заблуждение
            const serverMultiplier = targetPriceCents / betValueCents;
            if (Math.abs(serverMultiplier - input.targetMultiplier) / serverMultiplier > MULTIPLIER_TOLERANCE) {
                throw new UserError('UPGRADE_PRICE_CHANGED');
            }

            // Окно — ДО броска, только из цен и коэффициента
            const upgradeWindow = calcUpgradeWindow(betValueCents, targetPriceCents, config.frontendCoef);
            if (!upgradeWindow) {
                throw new UserError('UPGRADE_CHANCE_OUT_OF_RANGE');
            }
            if (!isChanceInRange(upgradeWindow.chance, config.minChance, config.maxChance)) {
                throw new UserError(
                    upgradeWindow.chance < config.minChance ? 'UPGRADE_CHANCE_TOO_LOW' : 'UPGRADE_CHANCE_TOO_HIGH',
                    { minChance: config.minChance, maxChance: config.maxChance },
                );
            }

            if (betAmountCents > 0) {
                await this.repositories.users.withdrawMoney(userId, fromCents(betAmountCents), transaction);
            }

            const { numbers, serverSeed, clientSeed, nonce } =
                await this.repositories.users.generateRandomNumbersWithSeeds(userId, 1, transaction);
            const roll = toRoll(numbers[0]);
            const win = isUpgradeWin(roll, upgradeWindow);

            const wonInventoryItem = win ? await this.repositories.inventory.add(userId, target, transaction) : null;

            const game = await this.db.UpgradeGame.create(
                {
                    userId,
                    betAmount: fromCents(betAmountCents),
                    betItemsValue: fromCents(betItemsValueCents),
                    betValue: fromCents(betValueCents),
                    targetItemId: target.id,
                    targetPrice: target.price,
                    multiplier: upgradeWindow.multiplier.toFixed(4),
                    chance: upgradeWindow.chance.toFixed(6),
                    roll,
                    winStart: upgradeWindow.winStart,
                    winEnd: upgradeWindow.winEnd,
                    win,
                    clientSeed,
                    serverSeed,
                    nonce,
                },
                { transaction },
            );

            if (betItems.length > 0) {
                await this.db.UpgradeGameBetItem.bulkCreate(
                    betItems.map(row => ({
                        upgradeGameId: game.id,
                        itemId: row.itemId,
                        value: inventoryItemValue(row).toFixed(2),
                    })),
                    { transaction },
                );
            }

            return { game, wonInventoryItem };
        });
    }
}

export default UpgradeGamesRepository;
