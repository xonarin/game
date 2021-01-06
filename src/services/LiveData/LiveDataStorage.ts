import Redis, { RedisOptions } from 'ioredis';

import config from '../../config';

const redisOptions: RedisOptions = {
    retryStrategy: times => Math.min(times * 50, 2000),
};

const redis = new Redis(config.redisUrl, redisOptions);

enum LiveDataStorageKeys {
    ONLINE = 'ld_online',
}

const resetOnline = async () => {
    await redis.del(LiveDataStorageKeys.ONLINE);
    await redis.set(LiveDataStorageKeys.ONLINE, 0);
};
const increaseOnline = async () => {
    await redis.incr(LiveDataStorageKeys.ONLINE);
};
const decreaseOnline = async () => {
    await redis.decr(LiveDataStorageKeys.ONLINE);
};
const getOnline = async () => {
    const online = await redis.get(LiveDataStorageKeys.ONLINE);

    return online ? parseInt(online, 10) : 0;
};

export { resetOnline, increaseOnline, decreaseOnline, getOnline };