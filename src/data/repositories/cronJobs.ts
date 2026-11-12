import { Transaction } from 'sequelize';

import BaseRepository from './base';
import { CRON_JOB_DEFAULTS, CronJob, CronJobKey } from '../models/CronJob';

/** Настройки расписаний фоновых задач (выполняет plant-admin, хранит game). */
class CronJobsRepository extends BaseRepository {
    // ── READ ──────────────────────────────────────────────────────────────────

    public list(): Promise<CronJob[]> {
        return this.db.CronJob.findAll({ order: [['key', 'ASC']] });
    }

    public get(key: string): Promise<CronJob | null> {
        return this.db.CronJob.findOne({ where: { key } });
    }

    // ── WRITE ─────────────────────────────────────────────────────────────────

    /** При старте: создать недостающие расписания (INSERT IGNORE — правки из админки не трогаются). */
    public async ensureDefaults(): Promise<void> {
        await this.db.CronJob.bulkCreate(CRON_JOB_DEFAULTS, { ignoreDuplicates: true });
    }

    /** Обновляет расписание существующей задачи; null — такой задачи нет. Значения уже проверены. */
    public async update(
        key: string,
        values: { cronExpression: string; timezone: string; enabled: boolean },
    ): Promise<CronJob | null> {
        const job = await this.get(key);
        if (!job) {
            return null;
        }
        return job.update(values);
    }

    /** Итог последнего запуска (вызывается при закрытии прогона). */
    public async markRun(key: CronJobKey, at: Date, status: string, transaction?: Transaction): Promise<void> {
        await this.db.CronJob.update({ lastRunAt: at, lastRunStatus: status }, { where: { key }, transaction });
    }

    /** Блокирует строку задачи до конца транзакции — мьютекс для старта/закрытия прогонов. */
    public async lockForUpdate(key: CronJobKey, transaction: Transaction): Promise<void> {
        await this.db.CronJob.findOne({ where: { key }, transaction, lock: transaction.LOCK.UPDATE });
    }
}

export default CronJobsRepository;
