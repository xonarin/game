import BaseRepository from './base';
import { DeployTarget } from '../models/DeployTarget';

/** Deploy targets (app instances / mirrors) managed from the admin deploy panel. */
class DeployTargetsRepository extends BaseRepository {
    async listTargets(): Promise<DeployTarget[]> {
        return this.db.DeployTarget.findAll({ order: [['id', 'ASC']] });
    }

    async addTarget(name: string, role: string, versionUrl: string, deployUrl?: string | null): Promise<DeployTarget> {
        return this.db.DeployTarget.create({
            name,
            role,
            versionUrl: versionUrl.replace(/\/+$/, ''),
            deployUrl: deployUrl ? deployUrl.replace(/\/+$/, '') : null,
            enabled: true,
        });
    }

    async setEnabled(id: string, enabled: boolean): Promise<void> {
        // Raw UPDATE avoids the model's `id` getter crash during a static Model.update.
        await this.db.sequelize.query('UPDATE `DeployTarget` SET `enabled` = :enabled WHERE `id` = :id', {
            replacements: { enabled, id },
        });
    }

    async removeTarget(id: string): Promise<void> {
        await this.db.DeployTarget.destroy({ where: { id } });
    }
}

export default DeployTargetsRepository;
