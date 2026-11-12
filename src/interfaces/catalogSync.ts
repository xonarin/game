/**
 * Контракт синхронизации каталога предметов CS2: plant-admin (воркер) -> game (API).
 *
 * Копия в /game и /plant-admin — менять синхронно.
 *   game:        src/interfaces/catalogSync.ts
 *   plant-admin: src/contracts/catalogSync.ts
 *
 * Только типы, без логики. Даты передаются строками ISO 8601 в UTC.
 *
 * Транспорт: POST /internal/sync/catalog/{start,batch,finish}, тело JSON
 * (Content-Type: application/json, можно Content-Encoding: gzip), лимит 5 МБ после распаковки.
 * Подпись — заголовки:
 *   X-Sync-Timestamp: unix-время в секундах (окно ±60 с)
 *   X-Sync-Signature: hex(HMAC-SHA256(SYNC_HMAC_SECRET, `${timestamp}\n${METHOD}\n${path}\n` + JSON-тело))
 * JSON-тело — байты ДО gzip; path — без query, например /internal/sync/catalog/batch.
 */

// ── COMMON ────────────────────────────────────────────────────────────────────

// Износ: Factory New, Minimal Wear, Field-Tested, Well-Worn, Battle-Scarred
export type Exterior = 'FN' | 'MW' | 'FT' | 'WW' | 'BS';

// Кто запустил прогон
export type SyncTrigger = 'manual' | 'cron';

// Итог прогона, который сообщает админка
export type SyncRunResult = 'ok' | 'failed';

// Тип предмета = префикс id в ByMykel all.json ("sticker-6044" -> 'sticker')
// Другие префиксы (collection, pet, tool …) в каталог не попадают: у них нет market_hash_name
export type ItemType =
    | 'skin'
    | 'sticker'
    | 'sticker_slab'
    | 'keychain'
    | 'crate'
    | 'key'
    | 'collectible'
    | 'agent'
    | 'patch'
    | 'graffiti'
    | 'music_kit';

// ── CATALOG ROW ───────────────────────────────────────────────────────────────

// Одна строка каталога = один уникальный market_hash_name
export interface CatalogRow {
    type: ItemType;
    // Как в источнике: без trim и нормализации
    marketHashName: string;

    // Только у type = 'skin', у остальных null
    // skin_id из ByMykel — группирует износы одного скина
    skinKey: string | null;
    weapon: string | null;
    // def_index оружия
    weaponId: number | null;
    // null у свёрнутых Doppler / Gamma Doppler (несколько фаз под одним именем)
    paintIndex: number | null;
    // null — у предмета нет износа (ванильные ножи и т.п.)
    exterior: Exterior | null;

    // skin: category.name ("Knives"); остальные: поле type из ByMykel ("Case", "Autograph", "Pin") или null
    category: string | null;
    stattrak: boolean;
    souvenir: boolean;
    // null у ключей; rarity и rarityColor заданы оба или оба null
    rarity: string | null;
    // "#d32ce6"
    rarityColor: string | null;
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

// ── CATALOG RUN RESPONSES ─────────────────────────────────────────────────────

export interface CatalogRunStartResponse {
    runId: string;
    status: 'running';
    // ISO 8601 UTC; catalog_seen_at строк этого прогона
    startedAt: string;
    batchesExpected: number;
    // true — повтор start для уже открытого прогона с тем же runId
    resumed: boolean;
}

export interface CatalogBatchResponse {
    runId: string;
    batchIndex: number;
    rowsReceived: number;
    rowsInserted: number;
    rowsUpdated: number;
    // true — пачка уже была принята раньше, данные не менялись
    duplicate: boolean;
}

export interface CatalogRunFinishResponse {
    runId: string;
    // Итог от game: ok только если получены все пачки
    status: SyncRunResult;
    error: string | null;
    batchesExpected: number;
    batchesReceived: number;
    rowsReceived: number;
    rowsInserted: number;
    rowsUpdated: number;
    // Предметы в БД, которых не было в этом импорте (не удаляются); null, если прогон не ok
    notSeenCount: number | null;
    // true — прогон уже был закрыт раньше (повтор finish)
    alreadyFinished: boolean;
}

// ── ERRORS ────────────────────────────────────────────────────────────────────

export type SyncErrorCode =
    | 'NOT_CONFIGURED' // 503: на game не задан SYNC_HMAC_SECRET
    | 'BAD_SIGNATURE' // 401: нет/неверная подпись или timestamp вне окна ±60 с
    | 'UNSUPPORTED_MEDIA_TYPE' // 415: не application/json или неизвестный Content-Encoding
    | 'PAYLOAD_TOO_LARGE' // 413: тело больше 5 МБ (после распаковки)
    | 'VALIDATION' // 400: тело не прошло проверку, подробности в details
    | 'RUN_NOT_FOUND' // 404
    | 'RUN_IN_PROGRESS' // 409: идёт другой прогон моложе часа
    | 'RUN_EXISTS' // 409: runId уже использован другим прогоном
    | 'RUN_CLOSED' // 409: пачка для уже закрытого прогона
    | 'INTERNAL'; // 500

// Тело любого ответа с ошибкой
export interface SyncErrorResponse {
    code: SyncErrorCode;
    error: string;
    details?: string[];
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
