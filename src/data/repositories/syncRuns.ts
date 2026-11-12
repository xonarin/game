import BaseRepository from './base';
import { SyncRun, SyncRunKind, SyncRunStatus } from '../models/SyncRun';

/** Журнал прогонов синхронизации (чтение для админки). Запись — services/catalogSync. */
class SyncRunsRepository extends BaseRepository {
    public list(kind: string, limit: number): Promise<SyncRun[]> {
        return this.db.SyncRun.findAll({
            where: { kind },
            order: [
                ['startedAt', 'DESC'],
                ['id', 'DESC'],
            ],
            limit,
        });
    }

    /** Время окончания последнего успешного прогона или null. */
    public async lastSuccessfulAt(kind: SyncRunKind): Promise<Date | null> {
        const at = await this.db.SyncRun.max<Date | null, SyncRun>('finishedAt', {
            where: { kind, status: SyncRunStatus.Ok },
        });
        return at || null;
    }
}

export default SyncRunsRepository;
