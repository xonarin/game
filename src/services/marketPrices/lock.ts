import mysql, { Connection, RowDataPacket } from 'mysql2/promise';

import config from '../../config';

/**
 * Именованная блокировка MySQL (GET_LOCK) на время прогона цен магазина.
 *
 * GET_LOCK принадлежит соединению, а запросы Sequelize идут через пул — поэтому блокировку держит
 * ОТДЕЛЬНОЕ соединение (как в migrate.ts). Оно закрывается в release(); если процесс упадёт,
 * MySQL снимет блокировку сам при обрыве соединения.
 */

export interface NamedLock {
    release(): Promise<void>;
}

/** null — блокировку держит другой прогон (ждать не будем). */
export const tryNamedLock = async (name: string): Promise<NamedLock | null> => {
    const conn: Connection = await mysql.createConnection({ uri: config.databaseUrl });
    try {
        const [rows] = await conn.query<RowDataPacket[]>('SELECT GET_LOCK(?, 0) AS `got`', [name]);
        if (Number(rows[0].got) !== 1) {
            await conn.end();
            return null;
        }
    } catch (err) {
        await conn.end().catch(() => undefined);
        throw err;
    }

    return {
        release: async () => {
            try {
                await conn.query('SELECT RELEASE_LOCK(?)', [name]);
            } finally {
                await conn.end().catch(() => undefined);
            }
        },
    };
};
