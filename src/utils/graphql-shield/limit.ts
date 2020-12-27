import { Request } from 'express';
import { rule } from 'graphql-shield';
import Redis, { RedisOptions } from 'ioredis';

import { User } from '../../data/models/User';
import config from '../../config';
import { UserError } from '../errors';

const redisOptions: RedisOptions = {
    retryStrategy: times => Math.min(times * 50, 2000),
};

const redis = new Redis(config.redisUrl, redisOptions);

const incrTtlLuaScript = `redis.call('set', KEYS[1], 0, 'EX', ARGV[2], 'NX') \
local consumed = redis.call('incrby', KEYS[1], ARGV[1]) \
local ttl = redis.call('pttl', KEYS[1]) \
if ttl == -1 then \
  redis.call('expire', KEYS[1], ARGV[2]) \
  ttl = 1000 * ARGV[2] \
end \
return {consumed, ttl} \
`;

redis.defineCommand('gqlslIncr', {
    numberOfKeys: 1,
    lua: incrTtlLuaScript,
});

export const makeLimiter = (
    secDuration: number,
    keyPrefix: string = 'gqlsl',
    points: number = 1,
    error: (key: string, ttl: number) => Error = () => new UserError('FREQUENT_REQUESTS'),
) => async (key: string): Promise<Error | null> => {
    const [currentPoints, ttl] = await redis.gqlslIncr(`${keyPrefix}:${key}`, 1, secDuration);

    if (currentPoints > points) {
        return error(key, ttl);
    }

    return null;
};

export const limit = (
    secDuration: number,
    keyPrefix: string = 'gqlsl',
    points: number = 1,
    error: (key: string, ttl: number) => Error = () => new UserError('FREQUENT_REQUESTS'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keyGetter: (ctx: any) => string = (ctx: { req: Request; user?: User }) => (ctx.user ? ctx.user.id : ctx.req.ip),
) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rule({ cache: 'no_cache' })(async (_0, _1, ctx: any) => {
        const key = keyGetter(ctx);
        const [currentPoints, ttl] = await redis.gqlslIncr(`${keyPrefix}:${key}`, 1, secDuration);

        if (currentPoints > points) {
            return error(key, ttl);
        }

        return true;
    });
};
