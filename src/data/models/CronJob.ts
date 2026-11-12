import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

/**
 * Настройки расписания фоновой задачи. Сами задачи выполняет plant-admin,
 * здесь только хранится расписание (редактируется в админке).
 * Таблицу `cron_job` создаёт sequelize.sync(); строки по умолчанию — CRON_JOB_DEFAULTS при старте.
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

// ── DEFAULTS ──────────────────────────────────────────────────────────────────

/**
 * Расписания, которые должны существовать всегда. Создаются при старте, если строки нет;
 * существующие (в т.ч. изменённые в админке) не перезаписываются.
 */
export const CRON_JOB_DEFAULTS: { key: CronJobKey; cronExpression: string; timezone: string; enabled: boolean }[] = [
    // Импорт каталога: понедельник 04:00 по Ташкенту
    { key: 'catalog_import', cronExpression: '0 4 * * 1', timezone: 'Asia/Tashkent', enabled: true },
];

// ── MODEL ─────────────────────────────────────────────────────────────────────

export const initCronJob = (sequelize: Sequelize): CronJobStatic =>
    sequelize.define(
        'CronJob',
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,

                // null у экземпляра, который Sequelize строит для статического Model.update()
                get(this: CronJob) {
                    const id = this.getDataValue('id') as unknown as number | null;
                    return id === null || id === undefined ? id : id.toString();
                },
            },

            key: { type: DataTypes.STRING(64), allowNull: false },
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
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            indexes: [{ name: 'uq_cron_job_key', unique: true, fields: ['key'] }],
        },
    ) as CronJobStatic;
