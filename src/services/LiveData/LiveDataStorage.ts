import Redis, { RedisOptions } from 'ioredis';

import config from '../../config';
import { getClassicLiveDataGame, getMinesLiveDataGame } from '../../data/modules/liveData/utils';
import { repositories } from '../../data/database';
import { LiveDataGameParent } from '../../data/modules/liveData/resolvers';
import { MinesGame } from '../../data/models/MinesGame';
import { ClassicGame } from '../../data/models/ClassicGame';
import { getTime } from '../../utils/time';
import { User } from '../../data/models/User';

const redisOptions: RedisOptions = {
    retryStrategy: times => Math.min(times * 50, 2000),
};

const redis = new Redis(config.redisUrl, redisOptions);

enum LiveDataStorageKeys {
    ONLINE = 'ld_online',
    GAMES = 'ld_games',
    QUEUE_GAMES = 'ld_queue_games',
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

const resetGames = async () => {
    await redis.del(LiveDataStorageKeys.GAMES);
    await redis.del(LiveDataStorageKeys.QUEUE_GAMES);
};

const getGames = async () => {
    const items = await redis.lrange(LiveDataStorageKeys.GAMES, 0, -1);
    if (!items) {
        return [];
    }

    return items.map(item => JSON.parse(item));
};

const addClassicGame = async (game: ClassicGame) => {
    const formattedGame = await getClassicLiveDataGame(game);

    await redis.rpush(
        LiveDataStorageKeys.QUEUE_GAMES,
        JSON.stringify({
            ...formattedGame,
            time: getTime(formattedGame.time),
        }),
    );
};

const addMinesGame = async (game: MinesGame) => {
    const formattedGame = getMinesLiveDataGame(game);
    await redis.rpush(
        LiveDataStorageKeys.QUEUE_GAMES,
        JSON.stringify({
            ...formattedGame,
            time: getTime(formattedGame.time),
        }),
    );
};

const getGameFromQueue = async () => {
    const item = await redis.lpop(LiveDataStorageKeys.QUEUE_GAMES);

    if (item !== null) {
        await redis
            .multi()
            .lpush(LiveDataStorageKeys.GAMES, item)
            .rpop(LiveDataStorageKeys.GAMES)
            .exec();

        return JSON.parse(item);
    }

    return null;
};

export {
    resetOnline,
    increaseOnline,
    decreaseOnline,
    getOnline,
    resetGames,
    getGames,
    addClassicGame,
    addMinesGame,
    getGameFromQueue,
};
