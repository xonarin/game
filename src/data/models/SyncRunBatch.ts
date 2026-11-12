import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

/**
 * Принятая пачка прогона. Нужна для идемпотентности: повтор той же пачки
 * (sync_run_id, batch_index) не увеличивает batches_received и счётчики строк.
 * Таблица `sync_run_batch` создаётся миграцией, НЕ sequelize.sync().
 */

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface SyncRunBatch extends Model {
    readonly syncRunId: number;
    readonly batchIndex: number;
    readonly rowsReceived: number;
    readonly rowsInserted: number;
    readonly rowsUpdated: number;
    readonly receivedAt: Date;
}

export type SyncRunBatchStatic = ModelStatic<SyncRunBatch>;

// ── MODEL ─────────────────────────────────────────────────────────────────────

export const initSyncRunBatch = (sequelize: Sequelize): SyncRunBatchStatic =>
    sequelize.define(
        'SyncRunBatch',
        {
            syncRunId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true },
            batchIndex: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true },
            rowsReceived: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
            rowsInserted: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
            rowsUpdated: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
            receivedAt: { type: DataTypes.DATE, allowNull: false },
        },
        {
            tableName: 'sync_run_batch',
            underscored: true,
            timestamps: false,
        },
    ) as SyncRunBatchStatic;
