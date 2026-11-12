import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

/**
 * Журнал прогонов синхронизации: импорт каталога и снимки цен магазинов.
 * Таблицу `sync_run` создаёт sequelize.sync() по этой модели; последующие изменения — миграциями.
 */

// ── TYPES ─────────────────────────────────────────────────────────────────────

export enum SyncRunKind {
    Catalog = 'catalog',
    Prices = 'prices',
}

export enum SyncRunTrigger {
    Manual = 'manual',
    Cron = 'cron',
}

export enum SyncRunStatus {
    Running = 'running',
    Ok = 'ok',
    Failed = 'failed',
    // Снимок цен не применён (строк меньше min_rows_ratio × прошлого успешного)
    Skipped = 'skipped',
}

export interface SyncRun extends Model {
    readonly id: string;
    // Генерирует админка: catalog-<ISO>-<random>
    readonly runId: string;
    readonly kind: SyncRunKind;
    // Магазин прогона цен; NULL у импорта каталога
    readonly marketId: string | null;
    readonly trigger: SyncRunTrigger;
    readonly status: SyncRunStatus;
    readonly startedAt: Date;
    readonly finishedAt: Date | null;

    readonly batchesExpected: number;
    readonly batchesReceived: number;
    readonly rowsReceived: number;
    readonly rowsInserted: number;
    readonly rowsUpdated: number;

    // Статистика из админки
    readonly sourceTotal: number;
    readonly duplicatesCollapsed: number;

    // Прогон цен: совпало с каталогом / в unmatched_name / удалено «нет в снимке» / изменилась цена или qty
    readonly rowsMatched: number;
    readonly rowsUnmatched: number;
    readonly rowsRemoved: number;
    readonly rowsChanged: number;

    readonly error: string | null;
}

export type SyncRunStatic = ModelStatic<SyncRun>;

// ── MODEL ─────────────────────────────────────────────────────────────────────

const counter = () => ({ type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 });

export const initSyncRun = (sequelize: Sequelize): SyncRunStatic =>
    sequelize.define(
        'SyncRun',
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,

                // null у экземпляра, который Sequelize строит для статического Model.update()
                get(this: SyncRun) {
                    const id = this.getDataValue('id') as unknown as number | null;
                    return id === null || id === undefined ? id : id.toString();
                },
            },

            runId: { type: DataTypes.STRING(64), allowNull: false },
            kind: { type: DataTypes.STRING(16), allowNull: false },
            // Удаление магазина журнал не стирает
            marketId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                references: { model: 'market', key: 'id' },
                onDelete: 'SET NULL',
            },
            trigger: { type: DataTypes.STRING(16), allowNull: false },
            status: { type: DataTypes.STRING(16), allowNull: false },
            startedAt: { type: DataTypes.DATE, allowNull: false },
            finishedAt: { type: DataTypes.DATE, allowNull: true },

            batchesExpected: counter(),
            batchesReceived: counter(),
            rowsReceived: counter(),
            rowsInserted: counter(),
            rowsUpdated: counter(),
            sourceTotal: counter(),
            duplicatesCollapsed: counter(),
            rowsMatched: counter(),
            rowsUnmatched: counter(),
            rowsRemoved: counter(),
            rowsChanged: counter(),

            error: { type: DataTypes.TEXT, allowNull: true },
        },
        {
            tableName: 'sync_run',
            underscored: true,
            timestamps: false, // есть свои started_at / finished_at
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            indexes: [
                { name: 'uq_sync_run_run_id', unique: true, fields: ['run_id'] },
                // Журнал: последние прогоны своего вида
                { name: 'idx_sync_run_kind_started', fields: ['kind', 'started_at'] },
            ],
        },
    ) as SyncRunStatic;
