import crypto from 'crypto';
import express, { NextFunction, Request, Response, Router } from 'express';

import config from '../../config';
import { SyncError } from './errors';
import { parseBatch, parsePriceSnapshot, parseRunFinish, parseRunStart } from './validate';
import { finishRun, receiveBatch, startRun } from './service';
import { applyPriceSnapshot } from '../marketPrices/service';

/**
 * POST /internal/sync/catalog/{start,batch,finish} — машинный приём каталога от plant-admin.
 * POST /internal/sync/prices/:market — полный снимок цен магазина.
 * Подключается в server.tsx ДО express.json(): тело читается сырым для проверки подписи.
 *
 * Конвейер: raw-тело (gzip распаковывает body-parser, лимит 5 МБ после распаковки)
 * -> HMAC-SHA256 подпись + timestamp ±60 с -> JSON.parse -> валидация -> сервис.
 * Схема подписи описана в src/interfaces/catalogSync.ts.
 */

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const BODY_LIMIT = '5mb';
const MAX_CLOCK_SKEW_SECONDS = 60;

const HEADER_TIMESTAMP = 'x-sync-timestamp';
const HEADER_SIGNATURE = 'x-sync-signature';

// ── SIGNATURE ─────────────────────────────────────────────────────────────────

const header = (req: Request, name: string): string => {
    const value = req.headers[name];
    return (Array.isArray(value) ? value[0] : value) || '';
};

const verifySignature = (req: Request, _res: Response, next: NextFunction) => {
    const secret = config.sync.hmacSecret;
    if (!secret) {
        next(new SyncError(503, 'NOT_CONFIGURED', 'Приём данных выключен: не задан SYNC_HMAC_SECRET'));
        return;
    }

    if (!Buffer.isBuffer(req.body)) {
        next(new SyncError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Ожидается Content-Type: application/json'));
        return;
    }

    const timestamp = header(req, HEADER_TIMESTAMP);
    const signature = header(req, HEADER_SIGNATURE);
    const ts = Number(timestamp);

    if (!/^\d{1,12}$/.test(timestamp) || Math.abs(Date.now() / 1000 - ts) > MAX_CLOCK_SKEW_SECONDS) {
        next(new SyncError(401, 'BAD_SIGNATURE', 'Нет X-Sync-Timestamp или он вне окна ±60 с'));
        return;
    }

    const path = req.originalUrl.split('?')[0];
    const expected = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}\n${req.method}\n${path}\n`)
        .update(req.body as Buffer)
        .digest();
    const given = /^[0-9a-f]{64}$/i.test(signature) ? Buffer.from(signature, 'hex') : Buffer.alloc(0);

    if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
        next(new SyncError(401, 'BAD_SIGNATURE', 'Неверная подпись X-Sync-Signature'));
        return;
    }

    next();
};

// ── HANDLERS ──────────────────────────────────────────────────────────────────

const parseJson = (req: Request): unknown => {
    try {
        return JSON.parse((req.body as Buffer).toString('utf8'));
    } catch {
        throw new SyncError(400, 'VALIDATION', 'Тело не является корректным JSON');
    }
};

const handle =
    <T>(parse: (body: unknown) => T, run: (input: T) => Promise<unknown>) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.json(await run(parse(parseJson(req))));
        } catch (err) {
            next(err);
        }
    };

// body-parser: ошибки размера / кодировки -> коды контракта
const toSyncError = (err: unknown): SyncError => {
    if (err instanceof SyncError) {
        return err;
    }

    const { type, status } = (err || {}) as { type?: string; status?: number };
    if (type === 'entity.too.large') {
        return new SyncError(413, 'PAYLOAD_TOO_LARGE', `Тело больше ${BODY_LIMIT} (после распаковки)`);
    }
    if (type === 'encoding.unsupported' || status === 415) {
        return new SyncError(
            415,
            'UNSUPPORTED_MEDIA_TYPE',
            'Неподдерживаемый Content-Encoding (нужен gzip или без сжатия)',
        );
    }
    if (status && status >= 400 && status < 500) {
        return new SyncError(400, 'VALIDATION', 'Не удалось прочитать тело запроса');
    }

    console.error('[sync] internal error:', err);
    return new SyncError(500, 'INTERNAL', 'Внутренняя ошибка');
};

// ── ROUTER ────────────────────────────────────────────────────────────────────

export default function catalogSyncRouter(): Router {
    const router = express.Router();

    router.use(express.raw({ type: 'application/json', limit: BODY_LIMIT, inflate: true }));
    router.use(verifySignature);

    router.post('/catalog/start', handle(parseRunStart, startRun));
    router.post('/catalog/batch', handle(parseBatch, receiveBatch));
    router.post('/catalog/finish', handle(parseRunFinish, finishRun));
    router.post('/prices/:market', async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.json(await applyPriceSnapshot(parsePriceSnapshot(String(req.params.market), parseJson(req))));
        } catch (err) {
            next(err);
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    router.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
        const syncError = toSyncError(err);
        if (syncError.status !== 500 && syncError.code !== 'VALIDATION') {
            console.warn(`[sync] ${req.method} ${req.originalUrl}: ${syncError.status} ${syncError.code}`);
        }
        res.status(syncError.status).json(syncError.toResponse());
    });

    return router;
}
