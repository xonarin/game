import BaseRepository from './base';
import { AuthClient } from '../models/AuthClient';

const CACHE_TTL_MS = 30 * 1000;

/** Normalizes an origin to scheme://host[:port] without a trailing slash. */
export const normalizeOrigin = (value: string): string => {
    const trimmed = (value || '').trim().replace(/\/+$/, '');
    try {
        return new URL(trimmed).origin;
    } catch {
        return trimmed;
    }
};

/** Allowed client sites for the central auth broker. Enabled rows are cached briefly. */
class AuthClientsRepository extends BaseRepository {
    private enabledCache: { at: number; byOrigin: Map<string, AuthClient> } | null = null;

    private async getEnabledMap(): Promise<Map<string, AuthClient>> {
        if (this.enabledCache && Date.now() - this.enabledCache.at < CACHE_TTL_MS) {
            return this.enabledCache.byOrigin;
        }
        const rows: AuthClient[] = await this.db.AuthClient.findAll({ where: { enabled: true } });
        const byOrigin = new Map(rows.map(row => [normalizeOrigin(row.origin), row]));
        this.enabledCache = { at: Date.now(), byOrigin };
        return byOrigin;
    }

    private invalidate() {
        this.enabledCache = null;
    }

    /** Returns the enabled client for this origin, or null if the origin is not allowed. */
    async getEnabledClient(origin: string): Promise<AuthClient | null> {
        const map = await this.getEnabledMap();
        return map.get(normalizeOrigin(origin)) ?? null;
    }

    async isAllowed(origin: string): Promise<boolean> {
        return (await this.getEnabledClient(origin)) !== null;
    }

    async listClients(): Promise<AuthClient[]> {
        return this.db.AuthClient.findAll({ order: [['id', 'DESC']] });
    }

    async addClient(origin: string, label?: string | null): Promise<AuthClient> {
        const created = await this.db.AuthClient.create({
            origin: normalizeOrigin(origin),
            label: label || null,
            enabled: true,
        });
        this.invalidate();
        return created;
    }

    async setEnabled(id: string, enabled: boolean): Promise<void> {
        // Raw UPDATE avoids the model's `id` getter crash during a static Model.update (see UsersRepository.setRole).
        await this.db.sequelize.query('UPDATE `AuthClient` SET `enabled` = :enabled WHERE `id` = :id', {
            replacements: { enabled, id },
        });
        this.invalidate();
    }

    async removeClient(id: string): Promise<void> {
        await this.db.AuthClient.destroy({ where: { id } });
        this.invalidate();
    }
}

export default AuthClientsRepository;
