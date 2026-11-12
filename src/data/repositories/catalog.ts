import { fn, col, Op, QueryTypes, Transaction } from 'sequelize';

import BaseRepository from './base';
import { CatalogRow } from '../../interfaces/catalogSync';

// Описательные поля, которые импорт обновляет у существующей строки.
// price / is_available / price_updated_at здесь нет намеренно — их ведут следующие этапы.
const UPDATE_COLUMNS = [
    'skin_key',
    'weapon',
    'weapon_id',
    'paint_index',
    'category',
    'exterior',
    'stattrak',
    'souvenir',
    'rarity',
    'rarity_color',
    'image',
    'catalog_seen_at',
    'updated_at',
];

const INSERT_COLUMNS = [
    'market_hash_name',
    ...UPDATE_COLUMNS.filter(c => c !== 'updated_at'),
    'created_at',
    'updated_at',
];

const ROW_PLACEHOLDER = `(${INSERT_COLUMNS.map(() => '?').join(', ')})`;

const quote = (column: string) => `\`${column}\``;

// ── SQL ───────────────────────────────────────────────────────────────────────

// Один multi-row INSERT … ON DUPLICATE KEY UPDATE на пачку (алиас строки `new`, MySQL 8.0.19+).
const buildUpsertSql = (rowCount: number) =>
    `INSERT INTO \`Item\` (${INSERT_COLUMNS.map(quote).join(', ')}) VALUES ` +
    `${Array(rowCount).fill(ROW_PLACEHOLDER).join(', ')} AS new ` +
    `ON DUPLICATE KEY UPDATE ${UPDATE_COLUMNS.map(c => `${quote(c)} = new.${quote(c)}`).join(', ')}`;

export interface CatalogStatsRow {
    category: string;
    count: number;
}

/** Каталог предметов CS2. */
class CatalogRepository extends BaseRepository {
    // ── IMPORT ────────────────────────────────────────────────────────────────

    /**
     * Upsert пачки одним запросом. inserted / updated считаются по числу имён, которые
     * уже были в таблице до вставки (вызывать внутри транзакции под блокировкой прогона).
     * market_hash_name пишется как есть; сравнение — utf8mb4_bin.
     */
    public async upsertRows(
        rows: CatalogRow[],
        seenAt: Date,
        now: Date,
        transaction: Transaction,
    ): Promise<{ inserted: number; updated: number }> {
        if (rows.length === 0) {
            return { inserted: 0, updated: 0 };
        }

        const names = rows.map(row => row.marketHashName);
        const [{ cnt }] = await this.db.sequelize.query<{ cnt: number }>(
            'SELECT COUNT(*) AS cnt FROM `Item` WHERE `market_hash_name` IN (?)',
            { replacements: [names], type: QueryTypes.SELECT, transaction },
        );
        const existing = Number(cnt);

        const values = rows.flatMap(row => [
            row.marketHashName,
            row.skinKey,
            row.weapon,
            row.weaponId,
            row.paintIndex,
            row.category,
            row.exterior,
            row.stattrak,
            row.souvenir,
            row.rarity,
            row.rarityColor,
            row.image,
            seenAt, // catalog_seen_at = начало прогона
            now, // created_at
            now, // updated_at
        ]);

        await this.db.sequelize.query(buildUpsertSql(rows.length), { replacements: values, transaction });

        return { inserted: rows.length - existing, updated: existing };
    }

    /** Сколько предметов не попало в импорт, начавшийся в startedAt. */
    public countNotSeenSince(startedAt: Date, transaction?: Transaction): Promise<number> {
        return this.db.Item.count({ where: { catalogSeenAt: { [Op.lt]: startedAt } }, transaction });
    }

    // ── STATS ─────────────────────────────────────────────────────────────────

    public count(): Promise<number> {
        return this.db.Item.count();
    }

    public async countByCategory(): Promise<CatalogStatsRow[]> {
        const rows = (await this.db.Item.findAll({
            attributes: ['category', [fn('COUNT', col('id')), 'count']],
            group: ['category'],
            order: [[fn('COUNT', col('id')), 'DESC']],
            raw: true,
        })) as unknown as Array<{ category: string; count: number | string }>;

        return rows.map(row => ({ category: row.category, count: Number(row.count) }));
    }
}

export default CatalogRepository;
