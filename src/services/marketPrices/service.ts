import { database, repositories } from '../../data/database';
import { CronJobKey } from '../../data/models/CronJob';
import { Market } from '../../data/models/Market';
import { SyncRun, SyncRunKind, SyncRunStatus, SyncRunTrigger } from '../../data/models/SyncRun';
import { PriceSnapshot, PriceSnapshotResponse } from '../../interfaces/catalogSync';
import { SyncError } from '../catalogSync/errors';
import { tryNamedLock } from './lock';
import { readPriceMultiplier } from './markup';

/**
 * Приём полного снимка цен магазина (POST /internal/sync/prices/:market).
 *
 * 1. магазин есть и включён, иначе 409 MARKET_UNAVAILABLE
 * 2. runId уже обработан -> 200 'duplicate', ничего не делаем
 * 3. блокировка prices_<code> (GET_LOCK), не получена -> 409 RUN_LOCKED
 * 4. под блокировкой: строк < min_rows_ratio × прошлого успешного -> sync_run 'skipped', 200
 * 5. staging multi-row пачками -> одна короткая транзакция (repositories.marketPrices.applySnapshot)
 * 6. staging прогона очищается, sync_run закрывается, market.last_sync_* и cron_job.last_run_*
 *
 * Проверка «битой выгрузки» стоит под блокировкой (а не до неё): иначе два прогона подряд
 * сравнивались бы с одним и тем же «прошлым успешным».
 */

// ── HELPERS ───────────────────────────────────────────────────────────────────

// DATETIME без долей секунды, как у остальных прогонов
const nowSeconds = () => new Date(Math.floor(Date.now() / 1000) * 1000);

const cronKey = (market: Market) => `prices_${market.code}` as CronJobKey;

const toResponse = (run: SyncRun, market: Market, status: PriceSnapshotResponse['status'], reason: string | null) => ({
    runId: run.runId,
    market: market.code,
    status,
    reason,
    rowsReceived: run.rowsReceived,
    rowsMatched: run.rowsMatched,
    rowsUnmatched: run.rowsUnmatched,
    rowsInserted: run.rowsInserted,
    rowsChanged: run.rowsChanged,
    rowsRemoved: run.rowsRemoved,
    itemsRepriced: run.rowsUpdated,
});

const findRun = (runId: string) => database.SyncRun.findOne({ where: { runId } });

/** Повтор runId: тот же магазин — 'duplicate' со счётчиками того прогона, чужой — 409. */
const duplicateResponse = (existing: SyncRun, market: Market): PriceSnapshotResponse => {
    // market_id приходит из БД числом, Market.id — строкой (getter)
    if (existing.kind !== SyncRunKind.Prices || String(existing.marketId) !== market.id) {
        throw new SyncError(409, 'RUN_EXISTS', `runId ${existing.runId} уже использован другим прогоном`);
    }
    return toResponse(existing, market, 'duplicate', `Прогон уже обработан (статус ${existing.status})`);
};

/** Строк в последнем успешном прогоне цен магазина; 0 — успешных ещё не было. */
const lastOkRows = async (market: Market): Promise<number> => {
    const last = await database.SyncRun.findOne({
        where: { kind: SyncRunKind.Prices, marketId: market.id, status: SyncRunStatus.Ok },
        order: [
            ['startedAt', 'DESC'],
            ['id', 'DESC'],
        ],
    });
    return last ? last.rowsReceived : 0;
};

const markFinished = async (market: Market, at: Date, status: SyncRunStatus) => {
    await repositories.markets.markSync(market.id, at, status);
    await repositories.cronJobs.markRun(cronKey(market), at, status);
};

// ── APPLY ─────────────────────────────────────────────────────────────────────

export const applyPriceSnapshot = async (input: PriceSnapshot): Promise<PriceSnapshotResponse> => {
    // 1. Магазин
    const market = await repositories.markets.getByCode(input.market);
    if (!market || !market.enabled) {
        throw new SyncError(
            409,
            'MARKET_UNAVAILABLE',
            market ? `Магазин ${input.market} выключен` : `Магазин ${input.market} не найден`,
        );
    }
    if (input.currency !== market.currency) {
        throw new SyncError(400, 'VALIDATION', 'Валюта снимка не совпадает с валютой магазина', [
            `currency ${input.currency}, у магазина ${market.currency}`,
        ]);
    }

    // 2. Повтор
    const existing = await findRun(input.runId);
    if (existing) {
        return duplicateResponse(existing, market);
    }

    // 3. Блокировка магазина
    const lock = await tryNamedLock(cronKey(market));
    if (!lock) {
        throw new SyncError(409, 'RUN_LOCKED', `По магазину ${market.code} уже применяется другой снимок`);
    }

    let run: SyncRun | null = null;
    try {
        // Пока ждали блокировку, тот же runId мог успеть обработаться
        const again = await findRun(input.runId);
        if (again) {
            return duplicateResponse(again, market);
        }

        const startedAt = nowSeconds();
        const base = {
            runId: input.runId,
            kind: SyncRunKind.Prices,
            marketId: market.id,
            trigger: input.trigger as SyncRunTrigger,
            startedAt,
            batchesExpected: 1,
            rowsReceived: input.rows.length,
            sourceTotal: input.sourceTotal,
        };

        // 4. Защита от битой выгрузки
        const lastRows = await lastOkRows(market);
        const minRows = Math.ceil(Number(market.minRowsRatio) * lastRows);
        if (input.rows.length < minRows) {
            const reason =
                `Строк ${input.rows.length} меньше ${market.minRowsRatio} × ${lastRows} (прошлый успешный) = ${minRows}. ` +
                'Снимок не применён';
            const skipped = await database.SyncRun.create({
                ...base,
                status: SyncRunStatus.Skipped,
                finishedAt: startedAt,
                error: reason,
            });
            await markFinished(market, startedAt, SyncRunStatus.Skipped);
            console.warn(`[prices] ${market.code} ${input.runId}: skipped — ${reason}`);
            return toResponse(skipped, market, 'skipped', reason);
        }

        run = await database.SyncRun.create({ ...base, status: SyncRunStatus.Running });

        // 5. Staging (вне транзакции), затем короткая транзакция применения
        await repositories.marketPrices.deleteStaleStaging(market.id, input.runId);
        await repositories.marketPrices.insertStaging(input.runId, market.id, input.rows);

        const appliedAt = nowSeconds();
        const stats = await database.sequelize.transaction(async t => {
            // Магазин могли выключить, пока шла вставка: выключение берёт ту же строку FOR UPDATE
            const locked = await repositories.markets.getByCode(market.code, t, true);
            if (!locked || !locked.enabled) {
                throw new SyncError(409, 'MARKET_UNAVAILABLE', `Магазин ${market.code} выключили во время прогона`);
            }
            // Наценка читается ПОСЛЕ блокировки строки магазина: пересчёт при смене наценки держит те же строки
            // Неверная настройка — текст уходит админке в ответе, а не «Внутренняя ошибка»
            const multiplier = await readPriceMultiplier(repositories).catch((err: Error) => {
                throw new SyncError(500, 'INTERNAL', err.message);
            });
            return repositories.marketPrices.applySnapshot(input.runId, market.id, multiplier, appliedAt, t);
        });

        // 6. Закрытие
        await repositories.marketPrices.deleteStaging(input.runId);
        const finishedAt = new Date();
        await run.update({
            status: SyncRunStatus.Ok,
            finishedAt,
            batchesReceived: 1,
            rowsMatched: stats.rowsMatched,
            rowsUnmatched: stats.rowsUnmatched,
            rowsInserted: stats.rowsInserted,
            rowsChanged: stats.rowsChanged,
            rowsRemoved: stats.rowsRemoved,
            rowsUpdated: stats.itemsRepriced,
        });
        await markFinished(market, finishedAt, SyncRunStatus.Ok);

        console.info(
            `[prices] ${market.code} ${input.runId}: ok — строк ${input.rows.length}, совпало ${stats.rowsMatched}, ` +
                `не совпало ${stats.rowsUnmatched}, новых ${stats.rowsInserted}, изменено ${stats.rowsChanged}, ` +
                `удалено ${stats.rowsRemoved}, предметов с новой ценой ${stats.itemsRepriced}`,
        );
        return toResponse(run, market, 'ok', null);
    } catch (err) {
        // Прогон открыт — закрываем как failed; staging прогона не оставляем
        if (run) {
            const failedAt = new Date();
            const message = err instanceof Error ? err.message : String(err);
            await repositories.marketPrices.deleteStaging(input.runId).catch(() => 0);
            await run.update({ status: SyncRunStatus.Failed, finishedAt: failedAt, error: message }).catch(() => run);
            await markFinished(market, failedAt, SyncRunStatus.Failed).catch(() => undefined);
        }
        throw err;
    } finally {
        await lock.release();
    }
};

// ── DISABLE ───────────────────────────────────────────────────────────────────

/**
 * Выключение магазина: флаг, удаление его цен и пересчёт затронутых предметов — одной транзакцией.
 * Строка магазина берётся FOR UPDATE: применение снимка ждёт и затем увидит enabled = false.
 */
export const disableMarket = (code: string) =>
    database.sequelize.transaction(async t => {
        const market = await repositories.markets.getByCode(code, t, true);
        if (!market) {
            return null;
        }
        await market.update({ enabled: false }, { transaction: t });
        const multiplier = await readPriceMultiplier(repositories);
        const result = await repositories.marketPrices.removeMarketPrices(market.id, multiplier, nowSeconds(), t);
        console.info(
            `[prices] ${code}: выключен — удалено цен ${result.rowsRemoved}, предметов с новой ценой ${result.itemsRepriced}`,
        );
        return market;
    });

// ── REPRICE ALL ───────────────────────────────────────────────────────────────

/**
 * Смена наценки (настройка prices::markup): пересчёт цен ВСЕХ предметов с ценами магазинов.
 * Вызывать ПОСЛЕ сохранения настройки. Строки всех магазинов берутся FOR UPDATE — идущее применение
 * снимка дождётся (и прочитает уже новую наценку) или будет дождано (и его предметы пересчитаются здесь).
 */
export const repriceAll = () =>
    database.sequelize.transaction(async t => {
        await database.Market.findAll({ transaction: t, lock: t.LOCK.UPDATE });
        const multiplier = await readPriceMultiplier(repositories);
        const itemsRepriced = await repositories.marketPrices.recalcAll(multiplier, nowSeconds(), t);
        console.info(`[prices] наценка изменена (×${multiplier}) — предметов с новой ценой ${itemsRepriced}`);
        return itemsRepriced;
    });
