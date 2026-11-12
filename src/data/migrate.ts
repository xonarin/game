import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mysql, { Connection, RowDataPacket } from 'mysql2/promise';

/**
 * SQL-миграции из migrations/*.sql.
 *
 * - runMigrations: применяет при старте сервера (после sequelize.sync(), см. server.tsx)
 * - getMigrationStatus: только чтение (migrate:status)
 * - rehashMigration: обновляет checksum после осознанной правки файла (migrate:rehash)
 *
 * Файлы выполняются через ОТДЕЛЬНОЕ соединение с multipleStatements — основной пул Sequelize
 * не трогается. DDL в MySQL коммитится неявно, откатить упавший файл нельзя, поэтому каждая
 * миграция должна быть безопасной для повторного запуска (IF NOT EXISTS, INSERT IGNORE …).
 */

// ── LEGACY ────────────────────────────────────────────────────────────────────

// Явный список исторических файлов (применялись вручную). Никогда не выполняются —
// при первом запуске только помечаются baseline. Граница «по имени» не используется.
export const LEGACY_FILES: ReadonlySet<string> = new Set([
    '2026-11-06-telegram-auth.sql',
    '2026-11-09-remove-modules-cleanup.sql',
    '2026-11-10-google-auth.sql',
    '2026-11-10-user-telegram-id.sql',
]);

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const TABLE = 'schema_migrations';
const LOCK_NAME = 'plant_schema_migrations';
const LOCK_TIMEOUT_SECONDS = 120;

// ── TYPES ─────────────────────────────────────────────────────────────────────

export type MigrationState =
    | 'applied' // применена
    | 'baseline' // исторический файл, помечен без выполнения
    | 'pending' // ожидает применения
    | 'pending-baseline' // исторический файл, будет помечен baseline
    | 'modified' // файл изменён после применения (checksum не совпадает)
    | 'missing'; // запись в schema_migrations есть, файла нет

export interface MigrationEntry {
    name: string;
    state: MigrationState;
    fileChecksum: string | null;
    dbChecksum: string | null;
    appliedAt: Date | null;
}

interface MigrationFile {
    name: string;
    sql: string;
    checksum: string;
}

interface AppliedRow extends RowDataPacket {
    name: string;
    checksum: string;
    baseline: number;
    applied_at: Date;
}

// ── PATHS & FILES ─────────────────────────────────────────────────────────────

/**
 * Путь к папке миграций выбирается явно, без проверки наличия:
 * 1) MIGRATIONS_DIR из env;
 * 2) production — рядом с бандлом: build/migrations (кладёт tools/copy);
 * 3) иначе (dev) — migrations/ в корне проекта (yarn запускает из корня).
 */
export const resolveMigrationsDir = (): string => {
    const fromEnv = (process.env.MIGRATIONS_DIR || '').trim();
    if (fromEnv) {
        return path.resolve(fromEnv);
    }
    if (process.env.NODE_ENV === 'production') {
        return path.resolve(__dirname, 'migrations');
    }
    return path.resolve(process.cwd(), 'migrations');
};

// CRLF -> LF: хеш не зависит от git autocrlf на машине сборки
export const checksumOf = (sql: string): string =>
    crypto.createHash('sha256').update(sql.replace(/\r\n/g, '\n')).digest('hex');

const readMigrationFiles = (dir: string): MigrationFile[] => {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
        throw new Error(`[migrate] папка миграций не найдена: ${dir}`);
    }

    return fs
        .readdirSync(dir)
        .filter(name => name.endsWith('.sql'))
        .sort()
        .map(name => {
            const sql = fs.readFileSync(path.join(dir, name), 'utf8');
            return { name, sql, checksum: checksumOf(sql) };
        });
};

// ── DB HELPERS ────────────────────────────────────────────────────────────────

const openConnection = (databaseUrl: string, multipleStatements: boolean): Promise<Connection> =>
    mysql.createConnection({ uri: databaseUrl, multipleStatements, timezone: 'Z' });

const tableExists = async (conn: Connection): Promise<boolean> => {
    const [rows] = await conn.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
        [TABLE],
    );
    return Number(rows[0].cnt) > 0;
};

const readApplied = async (conn: Connection): Promise<Map<string, AppliedRow>> => {
    if (!(await tableExists(conn))) {
        return new Map();
    }
    const [rows] = await conn.query<AppliedRow[]>(`SELECT name, checksum, baseline, applied_at FROM \`${TABLE}\``);
    return new Map(rows.map(row => [row.name, row]));
};

const computeStatus = (files: MigrationFile[], applied: Map<string, AppliedRow>): MigrationEntry[] => {
    const entries: MigrationEntry[] = files.map(file => {
        const row = applied.get(file.name);
        if (!row) {
            return {
                name: file.name,
                state: LEGACY_FILES.has(file.name) ? 'pending-baseline' : 'pending',
                fileChecksum: file.checksum,
                dbChecksum: null,
                appliedAt: null,
            };
        }

        let state: MigrationState = row.baseline ? 'baseline' : 'applied';
        if (row.checksum !== file.checksum) {
            state = 'modified';
        }

        return {
            name: file.name,
            state,
            fileChecksum: file.checksum,
            dbChecksum: row.checksum,
            appliedAt: row.applied_at,
        };
    });

    // Записи без файла
    const fileNames = new Set(files.map(file => file.name));
    applied.forEach(row => {
        if (!fileNames.has(row.name)) {
            entries.push({
                name: row.name,
                state: 'missing',
                fileChecksum: null,
                dbChecksum: row.checksum,
                appliedAt: row.applied_at,
            });
        }
    });

    return entries.sort((a, b) => a.name.localeCompare(b.name));
};

const count = (entries: MigrationEntry[], state: MigrationState) =>
    entries.filter(entry => entry.state === state).length;

// ── STATUS (read-only) ────────────────────────────────────────────────────────

export const getMigrationStatus = async (databaseUrl: string, dir: string): Promise<MigrationEntry[]> => {
    const files = readMigrationFiles(dir);
    const conn = await openConnection(databaseUrl, false);
    try {
        return computeStatus(files, await readApplied(conn));
    } finally {
        await conn.end();
    }
};

// ── RUN (startup) ─────────────────────────────────────────────────────────────

export const runMigrations = async (databaseUrl: string, dir: string): Promise<void> => {
    const files = readMigrationFiles(dir);
    const byName = new Map(files.map(file => [file.name, file]));

    // Отдельное соединение: multipleStatements нужен только здесь, не в основном пуле
    const conn = await openConnection(databaseUrl, true);

    try {
        const [lockRows] = await conn.query<RowDataPacket[]>('SELECT GET_LOCK(?, ?) AS ok', [
            LOCK_NAME,
            LOCK_TIMEOUT_SECONDS,
        ]);
        if (lockRows[0]?.ok !== 1) {
            throw new Error(
                `[migrate] блокировка ${LOCK_NAME} не получена за ${LOCK_TIMEOUT_SECONDS} с ` +
                    '(миграции применяет другой экземпляр или сессия держит блокировку)',
            );
        }

        try {
            await conn.query(
                `CREATE TABLE IF NOT EXISTS \`${TABLE}\` (
                    \`name\` VARCHAR(255) NOT NULL,
                    \`checksum\` CHAR(64) NOT NULL,
                    \`baseline\` BOOLEAN NOT NULL DEFAULT FALSE,
                    \`applied_at\` DATETIME NOT NULL,
                    PRIMARY KEY (\`name\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
            );

            const entries = computeStatus(files, await readApplied(conn));

            // Изменённый после применения файл — запуск запрещён
            const modified = entries.filter(entry => entry.state === 'modified');
            if (modified.length > 0) {
                const details = modified
                    .map(entry => `  ${entry.name}: в БД ${entry.dbChecksum}, файл ${entry.fileChecksum}`)
                    .join('\n');
                throw new Error(
                    `[migrate] файлы изменены после применения:\n${details}\n` +
                        'Проверьте изменения и выполните: yarn migrate:rehash <файл>',
                );
            }

            entries
                .filter(entry => entry.state === 'missing')
                .forEach(entry => console.warn(`[migrate] ${entry.name}: записан в ${TABLE}, но файла нет`));

            const toBaseline = entries.filter(entry => entry.state === 'pending-baseline');
            const toApply = entries.filter(entry => entry.state === 'pending');

            console.info(
                `[migrate] папка: ${dir}; файлов: ${files.length}; ` +
                    `baseline: ${count(entries, 'baseline') + toBaseline.length}; ` +
                    `применено ранее: ${count(entries, 'applied')}; ожидает: ${toApply.length}`,
            );

            // Строго по очереди, поэтому обычный цикл с await
            /* eslint-disable no-restricted-syntax, no-await-in-loop */
            for (const entry of toBaseline) {
                await conn.query(
                    `INSERT INTO \`${TABLE}\` (name, checksum, baseline, applied_at) VALUES (?, ?, TRUE, UTC_TIMESTAMP())`,
                    [entry.name, entry.fileChecksum],
                );
                console.info(`[migrate] ${entry.name}: baseline (исторический файл, не выполняется)`);
            }

            for (const entry of toApply) {
                const file = byName.get(entry.name)!;
                console.info(`[migrate] ${file.name}: применяю…`);
                try {
                    await conn.query(file.sql);
                } catch (err) {
                    throw new Error(`[migrate] ${file.name}: ошибка выполнения: ${(err as Error).message}`);
                }
                await conn.query(
                    `INSERT INTO \`${TABLE}\` (name, checksum, baseline, applied_at) VALUES (?, ?, FALSE, UTC_TIMESTAMP())`,
                    [file.name, file.checksum],
                );
            }
            /* eslint-enable no-restricted-syntax, no-await-in-loop */

            console.info(
                `[migrate] готово: применено сейчас ${toApply.length}, помечено baseline ${toBaseline.length}`,
            );
        } finally {
            await conn.query('SELECT RELEASE_LOCK(?)', [LOCK_NAME]);
        }
    } finally {
        await conn.end();
    }
};

// ── REHASH ────────────────────────────────────────────────────────────────────

/** Обновляет checksum применённого файла после ручной проверки правки. */
export const rehashMigration = async (
    databaseUrl: string,
    dir: string,
    name: string,
): Promise<{ oldChecksum: string; newChecksum: string }> => {
    const file = readMigrationFiles(dir).find(item => item.name === path.basename(name));
    if (!file) {
        throw new Error(`[migrate] файл не найден в ${dir}: ${name}`);
    }

    const conn = await openConnection(databaseUrl, false);
    try {
        const row = (await readApplied(conn)).get(file.name);
        if (!row) {
            throw new Error(`[migrate] ${file.name} ещё не применялся — rehash не нужен`);
        }

        await conn.query(`UPDATE \`${TABLE}\` SET checksum = ? WHERE name = ?`, [file.checksum, file.name]);
        return { oldChecksum: row.checksum, newChecksum: file.checksum };
    } finally {
        await conn.end();
    }
};
