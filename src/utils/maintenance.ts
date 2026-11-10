import Redis from 'ioredis';

import config from '../config';

const redis = new Redis(config.redisUrl, { retryStrategy: times => Math.min(times * 50, 2000) });

const KEY = 'maintenance';
const CACHE_TTL_MS = 2000;

let cache: { at: number; on: boolean } = { at: 0, on: false };

/** Whether the player site is closed for maintenance (deploys toggle this). Cached ~2s. */
export const isMaintenance = async (): Promise<boolean> => {
    if (Date.now() - cache.at < CACHE_TTL_MS) {
        return cache.on;
    }
    try {
        const value = await redis.get(KEY);
        cache = { at: Date.now(), on: value === '1' };
    } catch {
        // On Redis trouble, do not lock players out.
        cache = { at: Date.now(), on: false };
    }
    return cache.on;
};

export const setMaintenance = async (on: boolean): Promise<void> => {
    await redis.set(KEY, on ? '1' : '0');
    cache = { at: Date.now(), on };
};
