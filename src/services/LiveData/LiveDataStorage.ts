import Redis, { RedisOptions } from 'ioredis';

import config from '../../config';
import { getClassicLiveDataGame, getMinesLiveDataGame } from '../../data/modules/liveData/utils';
import { repositories } from '../../data/database';
import { LiveDataGameParent } from '../../data/modules/liveData/resolvers';
import { MinesGame } from '../../data/models/MinesGame';
import { ClassicGame } from '../../data/models/ClassicGame';
import { getTime } from '../../utils/time';

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
};

const increaseOnline = async (userId: string) => {
    await redis.sadd(LiveDataStorageKeys.ONLINE, userId);
};

const decreaseOnline = async (userId: string) => {
    await redis.srem(LiveDataStorageKeys.ONLINE, userId);
};

const getOnline = () => {
    return redis.scard(LiveDataStorageKeys.ONLINE);
};

const resetGames = async () => {
    await redis.del(LiveDataStorageKeys.GAMES);
    await redis.del(LiveDataStorageKeys.QUEUE_GAMES);
};

const getGames = async () => {
    const items = await redis.lrange(LiveDataStorageKeys.GAMES, 0, -1);

    if (items.length === 0) {
        const newItems: (Omit<LiveDataGameParent, 'time'> & { time: Date })[] = [];
        const classicGames = await repositories.classicGames.getLastGames(6);
        const minesGames = await repositories.minesGames.getLastGames(6);

        classicGames.forEach(async game => {
            newItems.push(await getClassicLiveDataGame(game));
        });

        minesGames.forEach(game => {
            newItems.push(getMinesLiveDataGame(game));
        });

        newItems.sort((a, b) => {
            if (a.time > b.time) {
                return -1;
            }

            if (a.time < b.time) {
                return 1;
            }

            return 0;
        });

        const outputItems = newItems.slice(0, 6).map(item => ({ ...item, time: getTime(item.time) }));

        outputItems.forEach(async el => {
            await redis.rpush(LiveDataStorageKeys.GAMES, JSON.stringify(el));
        });

        return outputItems;
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
