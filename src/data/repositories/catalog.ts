import { fn, col, literal, Op, Order, QueryTypes, Sequelize, Transaction, WhereOptions } from 'sequelize';

import BaseRepository from './base';
import { CatalogRow } from '../../interfaces/catalogSync';
import { Exterior, Item } from '../models/Item';

// Описательные поля, которые импорт обновляет у существующей строки.
// price / is_available / price_updated_at здесь нет намеренно — их ведут следующие этапы.
const UPDATE_COLUMNS = [
    'type',
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

// Сортировки списка предметов в админке
export const CATALOG_SORTS = [
    'name_asc',
    'price_asc',
    'price_desc',
    'exterior_asc',
    'exterior_desc',
    'available_first',
    'unavailable_first',
    'updated_desc',
    'updated_asc',
] as const;
export type CatalogSort = (typeof CATALOG_SORTS)[number];

export interface CatalogItemsFilter {
    // Слова через пробел; каждое — подстрока имени без учёта регистра
    search: string[];
    exteriors: Exterior[];
    // DECIMAL строкой ("10.00"); предметы без цены при заданном диапазоне не попадают
    minPrice: string | null;
    maxPrice: string | null;
    // true — только в наличии, false — только нет в наличии, null — все
    available: boolean | null;
    sort: CatalogSort;
    limit: number;
    offset: number;
}

// LIKE: %, _ и \ в запросе — буквально
const likeEscape = (word: string) => word.replace(/[\\%_]/g, char => `\\${char}`);

// Предметы без цены / без износа — в конце при любом направлении
const NULLS_LAST = (column: string) => literal(`\`${column}\` IS NULL`);
const EXTERIOR_ORDER = literal("FIELD(`exterior`, 'FN', 'MW', 'FT', 'WW', 'BS')");

const ORDER_BY: Record<CatalogSort, Order> = {
    name_asc: [['marketHashName', 'ASC']],
    price_asc: [
        [NULLS_LAST('price'), 'ASC'],
        ['price', 'ASC'],
        ['marketHashName', 'ASC'],
    ],
    price_desc: [
        [NULLS_LAST('price'), 'ASC'],
        ['price', 'DESC'],
        ['marketHashName', 'ASC'],
    ],
    exterior_asc: [
        [NULLS_LAST('exterior'), 'ASC'],
        [EXTERIOR_ORDER, 'ASC'],
        ['marketHashName', 'ASC'],
    ],
    exterior_desc: [
        [NULLS_LAST('exterior'), 'ASC'],
        [EXTERIOR_ORDER, 'DESC'],
        ['marketHashName', 'ASC'],
    ],
    // Внутри группы — по названию
    available_first: [
        ['isAvailable', 'DESC'],
        ['marketHashName', 'ASC'],
    ],
    unavailable_first: [
        ['isAvailable', 'ASC'],
        ['marketHashName', 'ASC'],
    ],
    // Цена ни разу не выставлялась — в конце
    updated_desc: [
        [NULLS_LAST('price_updated_at'), 'ASC'],
        ['priceUpdatedAt', 'DESC'],
        ['marketHashName', 'ASC'],
    ],
    updated_asc: [
        [NULLS_LAST('price_updated_at'), 'ASC'],
        ['priceUpdatedAt', 'ASC'],
        ['marketHashName', 'ASC'],
    ],
};

export interface CatalogTypeStatsRow {
    type: string;
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

        // Порядок — как в INSERT_COLUMNS
        const values = rows.flatMap(row => [
            row.marketHashName,
            row.type,
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

    // ── LIST ──────────────────────────────────────────────────────────────────

    /**
     * Страница предметов для админки: поиск по словам (без учёта регистра, не точный), фильтр по износу
     * и диапазону цены, сортировка. market_hash_name хранится в utf8mb4_bin, поэтому для поиска
     * сравнивается в utf8mb4_unicode_ci (полный просмотр ~45 000 строк — допустимо для админки).
     */
    public async listItems(filter: CatalogItemsFilter): Promise<{ total: number; items: Item[] }> {
        const conditions: WhereOptions[] = filter.search.map(word =>
            Sequelize.where(literal('`market_hash_name` COLLATE utf8mb4_unicode_ci'), {
                [Op.like]: `%${likeEscape(word)}%`,
            }),
        );
        if (filter.exteriors.length) {
            conditions.push({ exterior: { [Op.in]: filter.exteriors } });
        }
        if (filter.minPrice !== null) {
            conditions.push({ price: { [Op.gte]: filter.minPrice } });
        }
        if (filter.maxPrice !== null) {
            conditions.push({ price: { [Op.lte]: filter.maxPrice } });
        }
        if (filter.available !== null) {
            conditions.push({ isAvailable: filter.available });
        }

        const { count, rows } = await this.db.Item.findAndCountAll({
            where: { [Op.and]: conditions },
            order: ORDER_BY[filter.sort],
            limit: filter.limit,
            offset: filter.offset,
        });
        return { total: count, items: rows };
    }

    // ── STATS ─────────────────────────────────────────────────────────────────

    public count(): Promise<number> {
        return this.db.Item.count();
    }

    public async countByType(): Promise<CatalogTypeStatsRow[]> {
        const rows = (await this.db.Item.findAll({
            attributes: ['type', [fn('COUNT', col('id')), 'count']],
            group: ['type'],
            order: [[fn('COUNT', col('id')), 'DESC']],
            raw: true,
        })) as unknown as Array<{ type: string; count: number | string }>;

        return rows.map(row => ({ type: row.type, count: Number(row.count) }));
    }

    /** Скины по категориям оружия (Knives, Rifles…). */
    public async countSkinsByCategory(): Promise<CatalogStatsRow[]> {
        const rows = (await this.db.Item.findAll({
            attributes: ['category', [fn('COUNT', col('id')), 'count']],
            where: { type: 'skin' },
            group: ['category'],
            order: [[fn('COUNT', col('id')), 'DESC']],
            raw: true,
        })) as unknown as Array<{ category: string | null; count: number | string }>;

        return rows.map(row => ({ category: row.category ?? '—', count: Number(row.count) }));
    }
}

export default CatalogRepository;
