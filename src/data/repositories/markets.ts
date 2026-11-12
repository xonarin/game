import BaseRepository from './base';
import { pricesCronJobDefaults } from '../models/CronJob';
import { Market, MARKET_DEFAULTS } from '../models/Market';

/** Магазины скинов. Приём снимков цен и GraphQL управления — следующие шаги. */
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

    public getByCode(code: string): Promise<Market | null> {
        return this.db.Market.findOne({ where: { code } });
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
}

export default MarketsRepository;
