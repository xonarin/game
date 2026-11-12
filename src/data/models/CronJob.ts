import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

/**
 * Настройки расписания фоновой задачи. Сами задачи выполняет plant-admin,
 * здесь только хранится расписание (редактируется в админке).
 * Таблица `cron_job` создаётся миграцией, НЕ sequelize.sync().
 */

// ── TYPES ─────────────────────────────────────────────────────────────────────

export type CronJobKey = 'catalog_import';

export interface CronJob extends Model {
    readonly id: string;
    readonly key: CronJobKey;
    // Стандартный 5-полевой cron: "0 4 * * 1"
    readonly cronExpression: string;
    // IANA: "Asia/Tashkent"
    readonly timezone: string;
    readonly enabled: boolean;
    readonly lastRunAt: Date | null;
    readonly lastRunStatus: string | null;
    readonly updatedAt: Date;
}

export type CronJobStatic = ModelStatic<CronJob>;

// ── MODEL ─────────────────────────────────────────────────────────────────────

export const initCronJob = (sequelize: Sequelize): CronJobStatic =>
    sequelize.define(
        'CronJob',
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,

                get(this: CronJob) {
                    return (this.getDataValue('id') as unknown as number).toString();
                },
            },

            key: { type: DataTypes.STRING(64), allowNull: false, unique: true },
            cronExpression: { type: DataTypes.STRING(128), allowNull: false },
            timezone: { type: DataTypes.STRING(64), allowNull: false },
            enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            lastRunAt: { type: DataTypes.DATE, allowNull: true },
            lastRunStatus: { type: DataTypes.STRING(16), allowNull: true },
        },
        {
            tableName: 'cron_job',
            underscored: true,
            timestamps: true,
            createdAt: false, // в таблице только updated_at
        },
    ) as CronJobStatic;
