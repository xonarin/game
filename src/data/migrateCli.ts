/**
 * CLI миграций (без запуска сервера).
 *
 *   yarn migrate:status            — только чтение: применённые, baseline, ожидающие, изменённые
 *   yarn migrate:rehash <файл>     — обновить checksum после ручной проверки правки
 *
 * В dev запускается через babel-node, в сборке — `node migrate.js <команда>` (build/migrate.js).
 * Нужен DATABASE_URL; папка — как у сервера (MIGRATIONS_DIR / NODE_ENV).
 */
import { getMigrationStatus, MigrationState, rehashMigration, resolveMigrationsDir } from './migrate';

// ── CONFIG ────────────────────────────────────────────────────────────────────

const databaseUrl = (process.env.DATABASE_URL || process.env.CLEARDB_DATABASE_URL || '').trim();
const dir = resolveMigrationsDir();

const LABELS: Record<MigrationState, string> = {
    applied: 'применена',
    baseline: 'baseline',
    pending: 'ожидает',
    modified: 'ИЗМЕНЕНА после применения',
    missing: 'нет файла',
};

// ── COMMANDS ──────────────────────────────────────────────────────────────────

const status = async () => {
    const entries = await getMigrationStatus(databaseUrl, dir);

    console.info(`Папка: ${dir}\n`);
    entries.forEach(entry => {
        const at = entry.appliedAt ? entry.appliedAt.toISOString() : '';
        console.info(`${LABELS[entry.state].padEnd(26)} ${entry.name.padEnd(45)} ${at}`);
        if (entry.state === 'modified') {
            console.info(`${''.padEnd(27)}в БД ${entry.dbChecksum}\n${''.padEnd(27)}файл ${entry.fileChecksum}`);
        }
    });

    const total = (state: MigrationState) => entries.filter(entry => entry.state === state).length;
    console.info(
        `\nприменено: ${total('applied')}, baseline: ${total('baseline')}, ` +
            `ожидает: ${total('pending')}, изменено: ${total('modified')}, ` +
            `нет файла: ${total('missing')}`,
    );
};

const rehash = async (name: string | undefined) => {
    if (!name) {
        throw new Error('Укажите файл: migrate:rehash <имя файла>.sql');
    }
    const { oldChecksum, newChecksum } = await rehashMigration(databaseUrl, dir, name);
    if (oldChecksum === newChecksum) {
        console.info(`${name}: checksum не изменился (${newChecksum})`);
        return;
    }
    console.info(`${name}: checksum обновлён\n  был   ${oldChecksum}\n  стал  ${newChecksum}`);
};

// ── MAIN ──────────────────────────────────────────────────────────────────────

const main = async () => {
    if (!databaseUrl) {
        throw new Error('DATABASE_URL не задан');
    }

    const [command, arg] = process.argv.slice(2);
    switch (command) {
        case 'status':
            await status();
            break;
        case 'rehash':
            await rehash(arg);
            break;
        default:
            throw new Error('Команда: status | rehash <файл>');
    }
};

main().catch((err: Error) => {
    console.error(err.message);
    process.exitCode = 1;
});
