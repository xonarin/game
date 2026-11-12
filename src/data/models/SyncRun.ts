import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

/**
 * Журнал прогонов синхронизации (импорт каталога, позже — цены).
 * Таблица `sync_run` создаётся миграцией migrations/2026-11-12-catalog.sql, НЕ sequelize.sync().
 */

// ── TYPES ─────────────────────────────────────────────────────────────────────

export enum SyncRunKind {
    Catalog = 'catalog',
}

export enum SyncRunTrigger {
    Manual = 'manual',
    Cron = 'cron',
}

export enum SyncRunStatus {
    Running = 'running',
    Ok = 'ok',
    Failed = 'failed',
}

export interface SyncRun extends Model {
    readonly id: string;
    // Генерирует админка: catalog-<ISO>-<random>
    readonly runId: string;
    readonly kind: SyncRunKind;
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

                get(this: SyncRun) {
                    return (this.getDataValue('id') as unknown as number).toString();
                },
            },

            runId: { type: DataTypes.STRING(64), allowNull: false, unique: true },
            kind: { type: DataTypes.STRING(16), allowNull: false },
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

            error: { type: DataTypes.TEXT, allowNull: true },
        },
        {
            tableName: 'sync_run',
            underscored: true,
            timestamps: false, // есть свои started_at / finished_at
        },
    ) as SyncRunStatic;
