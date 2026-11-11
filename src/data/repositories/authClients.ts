import crypto from 'crypto';

import BaseRepository from './base';
import { AuthClient } from '../models/AuthClient';

const CACHE_TTL_MS = 30 * 1000;

// Dev-only fallback secret for a client whose per-domain secret is not set yet (local testing).
const DEV_FALLBACK_SECRET = 'dev-only-insecure-auth-shared-secret';

/** Normalizes an origin to scheme://host[:port] without a trailing slash. */
export const normalizeOrigin = (value: string): string => {
    const trimmed = (value || '').trim().replace(/\/+$/, '');
    try {
        return new URL(trimmed).origin;
    } catch {
        return trimmed;
    }
};

/**
 * A valid broker client origin: http(s) scheme + host only, no path/query/fragment.
 * Rejects arbitrary URLs so the allowlist cannot be turned into an open-redirect target.
 */
export const isValidOrigin = (value: string): boolean => {
    try {
        const url = new URL((value || '').trim());
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
        if (!url.hostname) return false;
        // normalizeOrigin must round-trip to the same value (no path/query smuggled in).
        return normalizeOrigin(value) === url.origin;
    } catch {
        return false;
    }
};

const timingSafeEqualStr = (a: string, b: string): boolean => {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
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

    /**
     * Timing-safe check of a client's /verify secret against its per-domain secret.
     * Falls back to the dev secret only in development when no per-domain secret is set.
     */
    async verifySecret(origin: string, secret: string): Promise<boolean> {
        if (!secret) return false;
        const client = await this.getEnabledClient(origin);
        if (!client) return false;
        const expected = client.secret || (__DEV__ ? DEV_FALLBACK_SECRET : null);
        if (!expected) return false;
        return timingSafeEqualStr(secret, expected);
    }

    async listClients(): Promise<AuthClient[]> {
        return this.db.AuthClient.findAll({ order: [['id', 'DESC']] });
    }

    async addClient(origin: string, label?: string | null, secret?: string | null): Promise<AuthClient> {
        const created = await this.db.AuthClient.create({
            origin: normalizeOrigin(origin),
            label: label || null,
            secret: secret || null,
            enabled: true,
        });
        this.invalidate();
        return created;
    }

    async setSecret(id: string, secret: string | null): Promise<void> {
        // Raw UPDATE avoids the model's `id` getter crash during a static Model.update.
        await this.db.sequelize.query('UPDATE `AuthClient` SET `secret` = :secret WHERE `id` = :id', {
            replacements: { secret: secret || null, id },
        });
        this.invalidate();
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
