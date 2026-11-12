import { Transaction } from 'sequelize';

import BaseRepository from './base';
import { pricesCronJobDefaults } from '../models/CronJob';
import { Market, MARKET_DEFAULTS } from '../models/Market';
import { UnmatchedName } from '../models/UnmatchedName';

/** Магазины скинов и их несовпавшие имена. Цены — MarketPricesRepository. */
class MarketsRepository extends BaseRepository {
    // ── READ ──────────────────────────────────────────────────────────────────

    public list(): Promise<Market[]> {
        return this.db.Market.findAll({
            order: [
                ['priority', 'ASC'],
                ['code', 'ASC'],
            ],
        });
    }

    public getByCode(code: string, transaction?: Transaction, lock = false): Promise<Market | null> {
        return this.db.Market.findOne({
            where: { code },
            transaction,
            ...(lock && transaction ? { lock: transaction.LOCK.UPDATE } : {}),
        });
    }

    public getById(id: string): Promise<Market | null> {
        return this.db.Market.findByPk(id);
    }

    // ── WRITE ─────────────────────────────────────────────────────────────────

    /**
     * При старте: создать недостающие магазины (выключенными) и их расписания prices_<code>.
     * INSERT IGNORE — правки из админки не трогаются.
     */
    public async ensureDefaults(): Promise<void> {
        await this.db.Market.bulkCreate(
            MARKET_DEFAULTS.map(market => ({ ...market, enabled: false })),
            { ignoreDuplicates: true },
        );
        await this.db.CronJob.bulkCreate(
            MARKET_DEFAULTS.map(market => pricesCronJobDefaults(market.code)),
            { ignoreDuplicates: true },
        );
    }

    /** Итог последней синхронизации магазина. */
    public async markSync(marketId: string, at: Date, status: string, transaction?: Transaction): Promise<void> {
        await this.db.Market.update(
            { lastSyncAt: at, lastSyncStatus: status },
            { where: { id: marketId }, transaction },
        );
    }

    // ── UNMATCHED NAMES ───────────────────────────────────────────────────────

    public async listUnmatched(
        marketId: string,
        limit: number,
        offset: number,
        includeIgnored: boolean,
    ): Promise<{ total: number; items: UnmatchedName[] }> {
        const where = includeIgnored ? { marketId } : { marketId, ignored: false };
        const { count, rows } = await this.db.UnmatchedName.findAndCountAll({
            where,
            // Дорогие — первыми: с ними разбираться в первую очередь
            order: [
                ['lastPrice', 'DESC'],
                ['marketHashName', 'ASC'],
            ],
            limit,
            offset,
        });
        return { total: count, items: rows };
    }

    /** null — такого имени у магазина нет. */
    public async setUnmatchedIgnored(
        marketId: string,
        marketHashName: string,
        ignored: boolean,
    ): Promise<UnmatchedName | null> {
        const row = await this.db.UnmatchedName.findOne({ where: { marketId, marketHashName } });
        return row ? row.update({ ignored }) : null;
    }
}

export default MarketsRepository;
