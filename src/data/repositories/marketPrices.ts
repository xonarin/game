import { QueryTypes, Transaction } from 'sequelize';

import BaseRepository from './base';
import { PriceRow } from '../../interfaces/catalogSync';

/**
 * Цены магазинов: staging снимка -> market_price / unmatched_name -> пересчёт Item.price.
 *
 * Весь прогон — единицы SQL-запросов, без поштучных сохранений. Затронутые предметы копятся
 * во временной таблице соединения (tmp_price_affected), поэтому применение и пересчёт идут
 * в ОДНОЙ транзакции (одно соединение). MySQL не даёт сослаться на временную таблицу дважды
 * в одном запросе — каждый запрос ниже обращается к ней один раз.
 *
 * Имена сравниваются только бинарно: staging.market_hash_name и Item.market_hash_name — utf8mb4_bin.
 */

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const STAGING_CHUNK = 1000; // строк в одном multi-row INSERT
const TMP = 'tmp_price_affected';

// Совпавшие строки снимка: id предмета каталога для каждой строки staging этого прогона
const MATCHED_ITEMS_SQL =
    'SELECT i.`id` FROM `market_price_staging` s ' +
    'JOIN `Item` i ON i.`market_hash_name` = s.`market_hash_name` WHERE s.`run_id` = ?';

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface SnapshotStats {
    rowsMatched: number;
    rowsUnmatched: number;
    rowsInserted: number;
    rowsChanged: number;
    rowsRemoved: number;
    itemsRepriced: number;
}

export interface OfferRow {
    marketCode: string;
    marketName: string;
    currency: string;
    priority: number;
    minPrice: string;
    priceUsd: string;
    qty: number;
    priceChangedAt: Date;
}

/** Цены магазинов: применение снимков, удаление при выключении магазина, предложения предмета. */
class MarketPricesRepository extends BaseRepository {
    // ── HELPERS ───────────────────────────────────────────────────────────────

    /** DML-запрос; возвращает affectedRows. */
    private async exec(sql: string, replacements: unknown[], transaction?: Transaction): Promise<number> {
        const [result] = await this.db.sequelize.query(sql, { replacements, transaction });
        return Number((result as { affectedRows?: number }).affectedRows ?? 0);
    }

    private async createAffectedTable(t: Transaction): Promise<void> {
        // Соединение из пула могло остаться с таблицей от упавшего прогона
        await this.exec(`DROP TEMPORARY TABLE IF EXISTS \`${TMP}\``, [], t);
        await this.exec(
            `CREATE TEMPORARY TABLE \`${TMP}\` (\`item_id\` INT UNSIGNED PRIMARY KEY) ENGINE=InnoDB`,
            [],
            t,
        );
    }

    private dropAffectedTable(t: Transaction): Promise<number> {
        return this.exec(`DROP TEMPORARY TABLE IF EXISTS \`${TMP}\``, [], t);
    }

    /**
     * Пересчёт Item для предметов из tmp_price_affected:
     * price = round(MIN(price_usd включённых магазинов) × multiplier, 2), is_available = есть такая строка.
     * Обновляются только реально изменившиеся строки; price_updated_at = now. Возвращает их число.
     */
    private recalcAffected(multiplier: string, now: Date, t: Transaction): Promise<number> {
        const newPrice = 'ROUND(p.`min_usd` * CAST(? AS DECIMAL(10,4)), 2)';
        return this.exec(
            'UPDATE `Item` i JOIN (' +
                'SELECT a.`item_id`, MIN(IF(m.`enabled` = 1, mp.`price_usd`, NULL)) AS `min_usd` ' +
                `FROM \`${TMP}\` a ` +
                'LEFT JOIN `market_price` mp ON mp.`item_id` = a.`item_id` ' +
                'LEFT JOIN `market` m ON m.`id` = mp.`market_id` ' +
                'GROUP BY a.`item_id`' +
                ') p ON p.`item_id` = i.`id` ' +
                `SET i.\`price_updated_at\` = ?, i.\`price\` = ${newPrice}, ` +
                'i.`is_available` = (p.`min_usd` IS NOT NULL) ' +
                `WHERE NOT (i.\`price\` <=> ${newPrice}) OR i.\`is_available\` <> (p.\`min_usd\` IS NOT NULL)`,
            [now, multiplier, multiplier],
            t,
        );
    }

    // ── STAGING ───────────────────────────────────────────────────────────────

    /** Bulk-вставка снимка multi-row пачками (вне транзакции применения). */
    public async insertStaging(runId: string, marketId: string, rows: PriceRow[]): Promise<void> {
        for (let start = 0; start < rows.length; start += STAGING_CHUNK) {
            const chunk = rows.slice(start, start + STAGING_CHUNK);
            const values = chunk.flatMap(([name, priceUsd, minPrice, qty]) => [
                runId,
                name,
                marketId,
                minPrice,
                priceUsd,
                qty,
            ]);
            // eslint-disable-next-line no-await-in-loop
            await this.exec(
                'INSERT INTO `market_price_staging` ' +
                    '(`run_id`, `market_hash_name`, `market_id`, `min_price`, `price_usd`, `qty`) VALUES ' +
                    Array(chunk.length).fill('(?, ?, ?, ?, ?, ?)').join(', '),
                values,
            );
        }
    }

    public deleteStaging(runId: string): Promise<number> {
        return this.exec('DELETE FROM `market_price_staging` WHERE `run_id` = ?', [runId]);
    }

    /** Остатки упавших прогонов этого магазина (вызывать под блокировкой магазина). */
    public deleteStaleStaging(marketId: string, currentRunId: string): Promise<number> {
        return this.exec('DELETE FROM `market_price_staging` WHERE `market_id` = ? AND `run_id` <> ?', [
            marketId,
            currentRunId,
        ]);
    }

    // ── APPLY ─────────────────────────────────────────────────────────────────

    /**
     * Применяет снимок прогона runId (уже в staging) к магазину marketId.
     * Вызывать в транзакции t; строки staging не удаляет.
     */
    public async applySnapshot(
        runId: string,
        marketId: string,
        multiplier: string,
        now: Date,
        t: Transaction,
    ): Promise<SnapshotStats> {
        // 1. Статистика до изменений: совпавшие / новые / изменившиеся (min_price или qty)
        const [counts] = await this.db.sequelize.query<{
            total: number;
            matched: string | null;
            inserted: string | null;
            changed: string | null;
        }>(
            'SELECT COUNT(*) AS `total`, ' +
                'SUM(i.`id` IS NOT NULL) AS `matched`, ' +
                'SUM(i.`id` IS NOT NULL AND mp.`item_id` IS NULL) AS `inserted`, ' +
                'SUM(mp.`item_id` IS NOT NULL AND (mp.`min_price` <> s.`min_price` OR mp.`qty` <> s.`qty`)) AS `changed` ' +
                'FROM `market_price_staging` s ' +
                'LEFT JOIN `Item` i ON i.`market_hash_name` = s.`market_hash_name` ' +
                'LEFT JOIN `market_price` mp ON mp.`item_id` = i.`id` AND mp.`market_id` = s.`market_id` ' +
                'WHERE s.`run_id` = ?',
            { replacements: [runId], type: QueryTypes.SELECT, transaction: t },
        );
        const total = Number(counts.total);
        const matched = Number(counts.matched ?? 0);

        await this.createAffectedTable(t);

        // 2. Затронутые цены: новые строки и смена price_usd (qty на цену не влияет)
        await this.exec(
            `INSERT IGNORE INTO \`${TMP}\` (\`item_id\`) ` +
                'SELECT i.`id` FROM `market_price_staging` s ' +
                'JOIN `Item` i ON i.`market_hash_name` = s.`market_hash_name` ' +
                'LEFT JOIN `market_price` mp ON mp.`item_id` = i.`id` AND mp.`market_id` = s.`market_id` ' +
                'WHERE s.`run_id` = ? AND (mp.`item_id` IS NULL OR mp.`price_usd` <> s.`price_usd`)',
            [runId],
            t,
        );

        // 3. Затронутые удалением: строки магазина, которых нет среди совпавших в снимке
        await this.exec(
            `INSERT IGNORE INTO \`${TMP}\` (\`item_id\`) ` +
                'SELECT mp.`item_id` FROM `market_price` mp ' +
                `LEFT JOIN (${MATCHED_ITEMS_SQL}) cur ON cur.\`id\` = mp.\`item_id\` ` +
                'WHERE mp.`market_id` = ? AND cur.`id` IS NULL',
            [runId, marketId],
            t,
        );

        // 4. Upsert совпавших. price_changed_at присваивается ПЕРВЫМ — пока min_price / qty ещё старые
        await this.exec(
            'INSERT INTO `market_price` ' +
                '(`item_id`, `market_id`, `min_price`, `price_usd`, `qty`, `price_changed_at`) ' +
                'SELECT * FROM (' +
                'SELECT i.`id` AS `item_id`, s.`market_id`, s.`min_price`, s.`price_usd`, s.`qty`, ? AS `changed_at` ' +
                'FROM `market_price_staging` s ' +
                'JOIN `Item` i ON i.`market_hash_name` = s.`market_hash_name` ' +
                'WHERE s.`run_id` = ?' +
                ') AS dt ' +
                'ON DUPLICATE KEY UPDATE ' +
                '`price_changed_at` = IF(`market_price`.`min_price` <> dt.`min_price` OR `market_price`.`qty` <> dt.`qty`, ' +
                'dt.`changed_at`, `market_price`.`price_changed_at`), ' +
                '`min_price` = dt.`min_price`, `price_usd` = dt.`price_usd`, `qty` = dt.`qty`',
            [now, runId],
            t,
        );

        // 5. Несовпавшие имена -> unmatched_name (цена — USD)
        await this.exec(
            'INSERT INTO `unmatched_name` ' +
                '(`market_id`, `market_hash_name`, `last_price`, `first_seen`, `last_seen`) ' +
                'SELECT * FROM (' +
                'SELECT s.`market_id`, s.`market_hash_name`, s.`price_usd` AS `last_price`, ' +
                '? AS `first_seen`, ? AS `last_seen` ' +
                'FROM `market_price_staging` s ' +
                'LEFT JOIN `Item` i ON i.`market_hash_name` = s.`market_hash_name` ' +
                'WHERE s.`run_id` = ? AND i.`id` IS NULL' +
                ') AS dt ' +
                'ON DUPLICATE KEY UPDATE `last_price` = dt.`last_price`, `last_seen` = dt.`last_seen`',
            [now, now, runId],
            t,
        );

        // Имя появилось в каталоге (новый импорт) — из несовпавших убираем
        await this.exec(
            'DELETE u FROM `unmatched_name` u ' +
                'JOIN `Item` i ON i.`market_hash_name` = u.`market_hash_name` WHERE u.`market_id` = ?',
            [marketId],
            t,
        );

        // 6. Удаление «нет в снимке» (DELETE … LEFT JOIN, не NOT IN)
        const rowsRemoved = await this.exec(
            'DELETE mp FROM `market_price` mp ' +
                `LEFT JOIN (${MATCHED_ITEMS_SQL}) cur ON cur.\`id\` = mp.\`item_id\` ` +
                'WHERE mp.`market_id` = ? AND cur.`id` IS NULL',
            [runId, marketId],
            t,
        );

        // 7. Пересчёт только затронутых предметов
        const itemsRepriced = await this.recalcAffected(multiplier, now, t);
        await this.dropAffectedTable(t);

        return {
            rowsMatched: matched,
            rowsUnmatched: total - matched,
            rowsInserted: Number(counts.inserted ?? 0),
            rowsChanged: Number(counts.changed ?? 0),
            rowsRemoved,
            itemsRepriced,
        };
    }

    /**
     * Выключение магазина: удалить все его цены и пересчитать затронутые предметы.
     * Вызывать в транзакции t ПОСЛЕ того, как market.enabled = false (пересчёт смотрит на флаг).
     */
    public async removeMarketPrices(
        marketId: string,
        multiplier: string,
        now: Date,
        t: Transaction,
    ): Promise<{ rowsRemoved: number; itemsRepriced: number }> {
        await this.createAffectedTable(t);
        await this.exec(
            `INSERT IGNORE INTO \`${TMP}\` (\`item_id\`) SELECT \`item_id\` FROM \`market_price\` WHERE \`market_id\` = ?`,
            [marketId],
            t,
        );
        const rowsRemoved = await this.exec('DELETE FROM `market_price` WHERE `market_id` = ?', [marketId], t);
        const itemsRepriced = await this.recalcAffected(multiplier, now, t);
        await this.dropAffectedTable(t);
        return { rowsRemoved, itemsRepriced };
    }

    /**
     * Смена наценки: пересчёт всех предметов, у которых есть цены магазинов или уже стоит цена / наличие.
     * Вызывать в транзакции t; возвращает число предметов с изменившейся ценой.
     */
    public async recalcAll(multiplier: string, now: Date, t: Transaction): Promise<number> {
        await this.createAffectedTable(t);
        await this.exec(
            `INSERT IGNORE INTO \`${TMP}\` (\`item_id\`) SELECT DISTINCT \`item_id\` FROM \`market_price\``,
            [],
            t,
        );
        await this.exec(
            `INSERT IGNORE INTO \`${TMP}\` (\`item_id\`) ` +
                'SELECT `id` FROM `Item` WHERE `price` IS NOT NULL OR `is_available` = 1',
            [],
            t,
        );
        const itemsRepriced = await this.recalcAffected(multiplier, now, t);
        await this.dropAffectedTable(t);
        return itemsRepriced;
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    /** Предложения предмета у включённых магазинов: дешевле — выше, при равной цене — по priority. */
    public offers(itemId: string): Promise<OfferRow[]> {
        return this.db.sequelize.query<OfferRow>(
            'SELECT m.`code` AS `marketCode`, m.`name` AS `marketName`, m.`currency`, m.`priority`, ' +
                'mp.`min_price` AS `minPrice`, mp.`price_usd` AS `priceUsd`, mp.`qty`, ' +
                'mp.`price_changed_at` AS `priceChangedAt` ' +
                'FROM `market_price` mp JOIN `market` m ON m.`id` = mp.`market_id` ' +
                'WHERE mp.`item_id` = ? AND m.`enabled` = 1 ' +
                'ORDER BY mp.`price_usd` ASC, m.`priority` ASC, m.`code` ASC',
            { replacements: [itemId], type: QueryTypes.SELECT },
        );
    }
}

export default MarketPricesRepository;
