import {
    CatalogBatch,
    CatalogRow,
    CatalogRunFinish,
    CatalogRunStart,
    Exterior,
    PriceSnapshot,
    SyncRunResult,
    SyncTrigger,
} from '../../interfaces/catalogSync';
import { ITEM_TYPES } from '../../data/models/Item';
import { SyncError } from './errors';

/**
 * Проверка тел /internal/sync/catalog/*. Ошибки копятся (до MAX_ERRORS) и уходят одним 400.
 * Длины строк считаются в символах (как VARCHAR в MySQL), а не в UTF-16 единицах.
 */

// ── LIMITS ────────────────────────────────────────────────────────────────────

export const MAX_BATCH_ROWS = 2000;
const MAX_BATCH_COUNT = 1000;
const MAX_TOTAL = 1_000_000;
const MAX_ERRORS = 20;

const EXTERIORS: readonly Exterior[] = ['FN', 'MW', 'FT', 'WW', 'BS'];
const TRIGGERS: readonly SyncTrigger[] = ['manual', 'cron'];
const RESULTS: readonly SyncRunResult[] = ['ok', 'failed'];

const RUN_ID_RE = /^[A-Za-z0-9:._-]{1,64}$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

// ── HELPERS ───────────────────────────────────────────────────────────────────

type Obj = Record<string, unknown>;

const charLength = (value: string) => Array.from(value).length;

class Checker {
    public readonly errors: string[] = [];

    public fail(message: string) {
        if (this.errors.length < MAX_ERRORS) {
            this.errors.push(message);
        }
    }

    public object(value: unknown, where: string): value is Obj {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            this.fail(`${where}: ожидается объект`);
            return false;
        }
        return true;
    }

    public string(obj: Obj, key: string, where: string, max: number, min = 1) {
        const value = obj[key];
        if (typeof value !== 'string') {
            this.fail(`${where}.${key}: ожидается строка`);
            return;
        }
        const len = charLength(value);
        if (len < min || len > max) {
            this.fail(`${where}.${key}: длина ${len}, допустимо ${min}…${max}`);
        }
    }

    public nullableString(obj: Obj, key: string, where: string, max: number) {
        if (obj[key] !== null) {
            this.string(obj, key, where, max);
        }
    }

    public int(obj: Obj, key: string, where: string, min: number, max: number, nullable = false) {
        const value = obj[key];
        if (value === null && nullable) {
            return;
        }
        if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
            this.fail(`${where}.${key}: ожидается целое ${min}…${max}${nullable ? ' или null' : ''}`);
        }
    }

    public bool(obj: Obj, key: string, where: string) {
        if (typeof obj[key] !== 'boolean') {
            this.fail(`${where}.${key}: ожидается boolean`);
        }
    }

    public oneOf<T>(obj: Obj, key: string, where: string, allowed: readonly T[], nullable = false) {
        const value = obj[key];
        if (value === null && nullable) {
            return;
        }
        if (!allowed.includes(value as T)) {
            this.fail(`${where}.${key}: допустимо ${allowed.join(' / ')}${nullable ? ' / null' : ''}`);
        }
    }

    public match(obj: Obj, key: string, where: string, re: RegExp, hint: string) {
        const value = obj[key];
        if (typeof value !== 'string' || !re.test(value)) {
            this.fail(`${where}.${key}: ожидается ${hint}`);
        }
    }

    public done<T>(value: unknown): T {
        if (this.errors.length > 0) {
            throw new SyncError(400, 'VALIDATION', 'Тело запроса не прошло проверку', this.errors);
        }
        return value as T;
    }
}

// ── START ─────────────────────────────────────────────────────────────────────

export const parseRunStart = (body: unknown): CatalogRunStart => {
    const c = new Checker();
    if (c.object(body, 'body')) {
        c.match(body, 'runId', 'body', RUN_ID_RE, 'строка [A-Za-z0-9:._-]{1,64}');
        c.oneOf(body, 'trigger', 'body', TRIGGERS);
        c.int(body, 'sourceTotal', 'body', 0, MAX_TOTAL);
        c.int(body, 'duplicatesCollapsed', 'body', 0, MAX_TOTAL);
        c.int(body, 'batchCount', 'body', 1, MAX_BATCH_COUNT);
    }
    return c.done<CatalogRunStart>(body);
};

// ── BATCH ─────────────────────────────────────────────────────────────────────

// Оружейные поля: у скина обязательны (кроме paintIndex / exterior), у остальных типов — null
const SKIN_ONLY_FIELDS = ['skinKey', 'weapon', 'weaponId', 'paintIndex', 'exterior'] as const;

const checkRow = (c: Checker, row: unknown, where: string) => {
    if (!c.object(row, where)) {
        return;
    }
    c.oneOf(row, 'type', where, ITEM_TYPES);
    c.string(row, 'marketHashName', where, 255);

    if (row.type === 'skin') {
        c.string(row, 'skinKey', where, 64);
        c.string(row, 'weapon', where, 64);
        c.int(row, 'weaponId', where, 0, 2_147_483_647);
        c.int(row, 'paintIndex', where, 0, 2_147_483_647, true);
        c.oneOf(row, 'exterior', where, EXTERIORS, true);
        c.string(row, 'category', where, 64);
    } else {
        SKIN_ONLY_FIELDS.forEach(key => {
            if (row[key] !== null) {
                c.fail(`${where}.${key}: у type «${String(row.type)}» ожидается null`);
            }
        });
        c.nullableString(row, 'category', where, 64);
    }

    c.bool(row, 'stattrak', where);
    c.bool(row, 'souvenir', where);

    // rarity и rarityColor — оба заданы или оба null (у ключей редкости нет)
    if (row.rarity !== null || row.rarityColor !== null) {
        c.string(row, 'rarity', where, 64);
        c.match(row, 'rarityColor', where, COLOR_RE, 'цвет #rrggbb (или null вместе с rarity)');
    }
    c.string(row, 'image', where, 2048);
};

/** batchIndex против batchCount прогона проверяется в сервисе (нужен прогон из БД). */
export const parseBatch = (body: unknown): CatalogBatch => {
    const c = new Checker();
    if (c.object(body, 'body')) {
        c.match(body, 'runId', 'body', RUN_ID_RE, 'строка [A-Za-z0-9:._-]{1,64}');
        c.int(body, 'batchIndex', 'body', 0, MAX_BATCH_COUNT - 1);

        const { rows } = body;
        if (!Array.isArray(rows) || rows.length === 0 || rows.length > MAX_BATCH_ROWS) {
            c.fail(`body.rows: ожидается массив из 1…${MAX_BATCH_ROWS} строк`);
        } else {
            const seen = new Set<string>();
            rows.forEach((row: unknown, index) => {
                checkRow(c, row, `rows[${index}]`);
                const name = (row as Partial<CatalogRow> | null)?.marketHashName;
                if (typeof name === 'string') {
                    if (seen.has(name)) {
                        c.fail(`rows[${index}].marketHashName: повтор в пачке «${name}»`);
                    }
                    seen.add(name);
                }
            });
        }
    }
    return c.done<CatalogBatch>(body);
};

// ── PRICES ────────────────────────────────────────────────────────────────────

const MARKET_CODE_RE = /^[a-z0-9_]{1,32}$/;
const CURRENCY_RE = /^[A-Z]{3}$/;
// DECIMAL(12,2): до 10 цифр до точки, ровно 2 после
const MONEY_RE = /^\d{1,10}\.\d{2}$/;
const RATE_RE = /^\d{1,6}(\.\d{1,8})?$/;
const MAX_PRICE_ROWS = 200_000;

const checkPriceRow = (c: Checker, row: unknown, where: string) => {
    if (!Array.isArray(row) || row.length !== 4) {
        c.fail(`${where}: ожидается [marketHashName, priceUsd, minPrice, qty]`);
        return;
    }
    const [name, priceUsd, minPrice, qty] = row as unknown[];
    if (typeof name !== 'string' || charLength(name) < 1 || charLength(name) > 255) {
        c.fail(`${where}[0] marketHashName: строка 1…255 символов`);
    }
    if (typeof priceUsd !== 'string' || !MONEY_RE.test(priceUsd)) {
        c.fail(`${where}[1] priceUsd: ожидается деньги "123.45"`);
    }
    if (typeof minPrice !== 'string' || !MONEY_RE.test(minPrice)) {
        c.fail(`${where}[2] minPrice: ожидается деньги "123.45"`);
    }
    if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1 || qty > 2_147_483_647) {
        c.fail(`${where}[3] qty: ожидается целое > 0`);
    }
};

/** marketParam — :market из пути; должен совпасть с body.market. */
export const parsePriceSnapshot = (marketParam: string, body: unknown): PriceSnapshot => {
    const c = new Checker();
    if (!MARKET_CODE_RE.test(marketParam)) {
        c.fail(`:market: ожидается код [a-z0-9_]{1,32}`);
    }
    if (c.object(body, 'body')) {
        c.match(body, 'runId', 'body', RUN_ID_RE, 'строка [A-Za-z0-9:._-]{1,64}');
        if (body.market !== marketParam) {
            c.fail('body.market: должен совпадать с :market в пути');
        }
        c.match(body, 'currency', 'body', CURRENCY_RE, 'код валюты ISO 4217 (USD)');
        c.match(body, 'rate', 'body', RATE_RE, 'курс строкой "1" или "0.0123"');
        if (typeof body.rate === 'string' && Number(body.rate) <= 0) {
            c.fail('body.rate: должен быть > 0');
        }
        if (typeof body.generatedAt !== 'string' || Number.isNaN(Date.parse(body.generatedAt))) {
            c.fail('body.generatedAt: ожидается дата ISO 8601');
        }
        c.oneOf(body, 'trigger', 'body', TRIGGERS);
        c.int(body, 'sourceTotal', 'body', 0, 100_000_000);

        const { rows } = body;
        if (!Array.isArray(rows) || rows.length > MAX_PRICE_ROWS) {
            c.fail(`body.rows: ожидается массив до ${MAX_PRICE_ROWS} строк`);
        } else {
            const seen = new Set<string>();
            rows.forEach((row: unknown, index) => {
                checkPriceRow(c, row, `rows[${index}]`);
                const name = Array.isArray(row) ? row[0] : undefined;
                if (typeof name === 'string') {
                    // utf8mb4_bin — PAD SPACE: «X» и «X » для ключа staging одно имя
                    const key = name.replace(/ +$/, '');
                    if (seen.has(key)) {
                        c.fail(`rows[${index}]: повтор имени «${name}»`);
                    }
                    seen.add(key);
                }
            });
        }
    }
    return c.done<PriceSnapshot>(body);
};

// ── FINISH ────────────────────────────────────────────────────────────────────

export const parseRunFinish = (body: unknown): CatalogRunFinish => {
    const c = new Checker();
    if (c.object(body, 'body')) {
        c.match(body, 'runId', 'body', RUN_ID_RE, 'строка [A-Za-z0-9:._-]{1,64}');
        c.oneOf(body, 'status', 'body', RESULTS);
        if (body.error !== undefined && body.error !== null) {
            c.string(body, 'error', 'body', 10_000, 0);
        }
    }
    return c.done<CatalogRunFinish>(body);
};
