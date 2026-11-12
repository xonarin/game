/**
 * Контракт синхронизации каталога скинов CS2: plant-admin (воркер) -> game (API).
 *
 * Копия в /game и /plant-admin — менять синхронно.
 *   game:        src/interfaces/catalogSync.ts
 *   plant-admin: src/contracts/catalogSync.ts
 *
 * Только типы, без логики. Даты передаются строками ISO 8601 в UTC.
 */

// ── COMMON ────────────────────────────────────────────────────────────────────

// Износ: Factory New, Minimal Wear, Field-Tested, Well-Worn, Battle-Scarred
export type Exterior = 'FN' | 'MW' | 'FT' | 'WW' | 'BS';

// Кто запустил прогон
export type SyncTrigger = 'manual' | 'cron';

// Итог прогона, который сообщает админка
export type SyncRunResult = 'ok' | 'failed';

// ── CATALOG ROW ───────────────────────────────────────────────────────────────

// Одна строка каталога = один уникальный market_hash_name
export interface CatalogRow {
    // Как в источнике: без trim и нормализации
    marketHashName: string;
    // skin_id из ByMykel — группирует износы одного скина
    skinKey: string;
    weapon: string;
    // def_index оружия
    weaponId: number;
    // null у свёрнутых Doppler / Gamma Doppler (несколько фаз под одним именем)
    paintIndex: number | null;
    category: string;
    // null — у предмета нет износа (ванильные ножи и т.п.)
    exterior: Exterior | null;
    stattrak: boolean;
    souvenir: boolean;
    rarity: string;
    // "#d32ce6"
    rarityColor: string;
    image: string;
}

// ── CATALOG RUN (POST /internal/sync/catalog/*) ───────────────────────────────

// start: открыть прогон
export interface CatalogRunStart {
    // catalog-<ISO время>-<random>, генерирует админка
    runId: string;
    trigger: SyncTrigger;
    // Объектов в исходном файле
    sourceTotal: number;
    // Сколько объектов свёрнуто в чужие строки (Doppler-фазы)
    duplicatesCollapsed: number;
    // Сколько пачек будет отправлено
    batchCount: number;
}

// batch: одна пачка строк, до 2000; повтор того же batchIndex безопасен
export interface CatalogBatch {
    runId: string;
    // 0 … batchCount - 1
    batchIndex: number;
    rows: CatalogRow[];
}

// finish: закрыть прогон
export interface CatalogRunFinish {
    runId: string;
    status: SyncRunResult;
    // Текст ошибки при status = 'failed'
    error?: string;
}

// ── CRON JOB ──────────────────────────────────────────────────────────────────

// Настройки расписания (хранятся в game, выполняет plant-admin)
export interface CronJob {
    // 'catalog_import' (позже 'prices_lisskins' и т.д.)
    key: string;
    // Стандартный 5-полевой cron: "0 4 * * 1"
    cronExpression: string;
    // IANA: "Asia/Tashkent"
    timezone: string;
    enabled: boolean;
    // ISO 8601 UTC или null, если ещё не запускалась
    lastRunAt: string | null;
    lastRunStatus: string | null;
}
