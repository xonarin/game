import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';

import config from '../../config';

const redis = new Redis(config.redisUrl, {
    retryStrategy: times => Math.min(times * 50, 2000),
});

const rateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'middleware',
    points: 10,
    duration: 1,
});

const rateLimiterMiddleware = () => (req: Request, res: Response, next: NextFunction) => {
    rateLimiter
        .consume(req.ip)
        .then(() => next())
        .catch(() => res.status(429).send('Too Many Requests'));
};

export default rateLimiterMiddleware;
