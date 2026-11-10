import crypto from 'crypto';
import Redis from 'ioredis';

import config from '../config';

const redis = new Redis(config.redisUrl, { retryStrategy: times => Math.min(times * 50, 2000) });

const TTL_SECONDS = 60;
const KEY = (code: string) => `authcode:${code}`;

export interface CodePayload {
    userId: string;
    from: string;
    isNew: boolean;
}

/** Issues a short-lived, single-use code that a site exchanges for the user via /verify. */
export const createCode = async (payload: CodePayload): Promise<string> => {
    const code = crypto.randomBytes(32).toString('base64url');
    await redis.set(KEY(code), JSON.stringify(payload), 'EX', TTL_SECONDS);
    return code;
};

/** Reads and deletes a code (single-use). Returns null if missing/expired. */
export const consumeCode = async (code: string): Promise<CodePayload | null> => {
    const key = KEY(code);
    const value = await redis.get(key);
    if (!value) return null;
    await redis.del(key);
    try {
        return JSON.parse(value) as CodePayload;
    } catch {
        return null;
    }
};
