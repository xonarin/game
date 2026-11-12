import { Op, Transaction } from 'sequelize';

import { database, repositories } from '../../data/database';
import { SyncRun, SyncRunKind, SyncRunStatus, SyncRunTrigger } from '../../data/models/SyncRun';
import {
    CatalogBatch,
    CatalogBatchResponse,
    CatalogRunFinish,
    CatalogRunFinishResponse,
    CatalogRunStart,
    CatalogRunStartResponse,
    SyncRunResult,
} from '../../interfaces/catalogSync';
import { SyncError } from './errors';

/**
 * Приём каталога от plant-admin: start -> batch × N -> finish.
 *
 * Порядок блокировок везде один (cron_job 'catalog_import' -> sync_run), чтобы не ловить дедлоки:
 * - start / finish: сначала строка cron_job (мьютекс прогонов каталога), затем прогон
 * - batch: только строка прогона (пачки одного прогона идут строго по одной)
 */

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const CRON_KEY = 'catalog_import';
const STALE_RUN_MS = 60 * 60 * 1000; // running старше часа считается зависшим

// DATETIME без долей секунды: catalog_seen_at = started_at должен совпадать точно
const nowSeconds = () => new Date(Math.floor(Date.now() / 1000) * 1000);

const transaction = <T>(fn: (t: Transaction) => Promise<T>): Promise<T> => database.sequelize.transaction(fn);

const findRun = (runId: string, t: Transaction, lock = false) =>
    database.SyncRun.findOne({ where: { runId }, transaction: t, ...(lock ? { lock: t.LOCK.UPDATE } : {}) });

// ── START ─────────────────────────────────────────────────────────────────────

export const startRun = (input: CatalogRunStart): Promise<CatalogRunStartResponse> =>
    transaction(async t => {
        await repositories.cronJobs.lockForUpdate(CRON_KEY, t);
        const now = nowSeconds();

        const toResponse = (run: SyncRun, resumed: boolean): CatalogRunStartResponse => ({
            runId: run.runId,
            status: 'running',
            startedAt: run.startedAt.toISOString(),
            batchesExpected: run.batchesExpected,
            resumed,
        });

        // Повтор start (ответ потерялся): тот же открытый прогон — отдаём его
        const existing = await findRun(input.runId, t);
        if (existing) {
            if (
                existing.kind === SyncRunKind.Catalog &&
                existing.status === SyncRunStatus.Running &&
                existing.batchesExpected === input.batchCount
            ) {
                return toResponse(existing, true);
            }
            throw new SyncError(409, 'RUN_EXISTS', `runId ${input.runId} уже использован (статус ${existing.status})`);
        }

        // Зависшие running старше часа -> failed
        const [staleCount] = await database.SyncRun.update(
            {
                status: SyncRunStatus.Failed,
                finishedAt: now,
                error: 'Зависший прогон: finish не получен в течение часа',
            },
            {
                where: {
                    kind: SyncRunKind.Catalog,
                    status: SyncRunStatus.Running,
                    startedAt: { [Op.lt]: new Date(now.getTime() - STALE_RUN_MS) },
                },
                transaction: t,
            },
        );
        if (staleCount > 0) {
            await repositories.cronJobs.markRun(CRON_KEY, now, SyncRunStatus.Failed, t);
        }

        const running = await database.SyncRun.findOne({
            where: { kind: SyncRunKind.Catalog, status: SyncRunStatus.Running },
            transaction: t,
        });
        if (running) {
            throw new SyncError(
                409,
                'RUN_IN_PROGRESS',
                `Уже выполняется прогон ${running.runId} (начат ${running.startedAt.toISOString()})`,
            );
        }

        // started_at строго больше, чем у прошлого прогона: иначе (два прогона в одну секунду)
        // строки прошлого прогона не считались бы «не попавшими» в новый (catalog_seen_at < started_at)
        const lastStartedAt = await database.SyncRun.max<Date | null, SyncRun>('startedAt', {
            where: { kind: SyncRunKind.Catalog },
            transaction: t,
        });
        const startedAt =
            lastStartedAt && lastStartedAt.getTime() >= now.getTime() ? new Date(lastStartedAt.getTime() + 1000) : now;

        const run = await database.SyncRun.create(
            {
                runId: input.runId,
                kind: SyncRunKind.Catalog,
                trigger: input.trigger as SyncRunTrigger,
                status: SyncRunStatus.Running,
                startedAt,
                batchesExpected: input.batchCount,
                sourceTotal: input.sourceTotal,
                duplicatesCollapsed: input.duplicatesCollapsed,
            },
            { transaction: t },
        );

        return toResponse(run, false);
    });

// ── BATCH ─────────────────────────────────────────────────────────────────────

export const receiveBatch = (input: CatalogBatch): Promise<CatalogBatchResponse> =>
    transaction(async t => {
        const run = await findRun(input.runId, t, true);
        if (!run || run.kind !== SyncRunKind.Catalog) {
            throw new SyncError(404, 'RUN_NOT_FOUND', `Прогон ${input.runId} не найден`);
        }
        if (input.batchIndex >= run.batchesExpected) {
            throw new SyncError(400, 'VALIDATION', 'batchIndex вне диапазона', [
                `batchIndex ${input.batchIndex}, допустимо 0…${run.batchesExpected - 1}`,
            ]);
        }

        const response = (
            stats: { rowsReceived: number; rowsInserted: number; rowsUpdated: number },
            duplicate: boolean,
        ) => ({
            runId: run.runId,
            batchIndex: input.batchIndex,
            ...stats,
            duplicate,
        });

        // Повтор уже принятой пачки: данные и счётчики не трогаем
        const accepted = await database.SyncRunBatch.findOne({
            where: { syncRunId: run.id, batchIndex: input.batchIndex },
            transaction: t,
        });
        if (accepted) {
            const { rowsReceived, rowsInserted, rowsUpdated } = accepted;
            return response({ rowsReceived, rowsInserted, rowsUpdated }, true);
        }

        if (run.status !== SyncRunStatus.Running) {
            throw new SyncError(409, 'RUN_CLOSED', `Прогон ${run.runId} уже закрыт (статус ${run.status})`);
        }

        const now = new Date();
        const { inserted, updated } = await repositories.catalog.upsertRows(input.rows, run.startedAt, now, t);
        const stats = { rowsReceived: input.rows.length, rowsInserted: inserted, rowsUpdated: updated };

        await database.SyncRunBatch.create(
            { syncRunId: run.id, batchIndex: input.batchIndex, ...stats, receivedAt: now },
            { transaction: t },
        );
        await run.increment(
            {
                batchesReceived: 1,
                rowsReceived: stats.rowsReceived,
                rowsInserted: stats.rowsInserted,
                rowsUpdated: stats.rowsUpdated,
            },
            { transaction: t },
        );

        return response(stats, false);
    });

// ── FINISH ────────────────────────────────────────────────────────────────────

export const finishRun = (input: CatalogRunFinish): Promise<CatalogRunFinishResponse> =>
    transaction(async t => {
        await repositories.cronJobs.lockForUpdate(CRON_KEY, t);

        const run = await findRun(input.runId, t, true);
        if (!run || run.kind !== SyncRunKind.Catalog) {
            throw new SyncError(404, 'RUN_NOT_FOUND', `Прогон ${input.runId} не найден`);
        }

        const toResponse = (closed: SyncRun, notSeenCount: number | null, alreadyFinished: boolean) => ({
            runId: closed.runId,
            status: (closed.status === SyncRunStatus.Ok ? 'ok' : 'failed') as SyncRunResult,
            error: closed.error,
            batchesExpected: closed.batchesExpected,
            batchesReceived: closed.batchesReceived,
            rowsReceived: closed.rowsReceived,
            rowsInserted: closed.rowsInserted,
            rowsUpdated: closed.rowsUpdated,
            notSeenCount,
            alreadyFinished,
        });

        // Повтор finish: отдаём итог уже закрытого прогона
        if (run.status !== SyncRunStatus.Running) {
            const notSeen =
                run.status === SyncRunStatus.Ok ? await repositories.catalog.countNotSeenSince(run.startedAt, t) : null;
            return toResponse(run, notSeen, true);
        }

        let status = SyncRunStatus.Ok;
        let error: string | null = null;

        if (input.status === 'failed') {
            status = SyncRunStatus.Failed;
            error = input.error || 'Прогон прерван админкой без описания ошибки';
        } else if (run.batchesReceived !== run.batchesExpected) {
            status = SyncRunStatus.Failed;
            error = `Получено пачек ${run.batchesReceived} из ${run.batchesExpected}`;
        }

        const finishedAt = new Date();
        await run.update({ status, error, finishedAt }, { transaction: t });
        await repositories.cronJobs.markRun(CRON_KEY, finishedAt, status, t);

        // Отсутствующие в импорте предметы не удаляются — только считаются
        const notSeen =
            status === SyncRunStatus.Ok ? await repositories.catalog.countNotSeenSince(run.startedAt, t) : null;

        return toResponse(run, notSeen, false);
    });
