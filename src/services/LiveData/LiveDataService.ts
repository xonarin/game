import config from '../../config';
import pubsub from '../../data/pubsub';
import { getLiveDataGames } from '../../data/modules/liveData/resolvers';
import { repositories } from '../../data/database';
import { getCalculatedOnline } from '../../data/modules/liveData/utils';

export default class LiveDataService {
    public initStart = async (): Promise<void> => {
        setInterval(async () => {
            const items = await getLiveDataGames(repositories);
            await pubsub.publish('games', {
                items,
                count: items.length,
            });
        }, config.app.lastBidDelay);

        setInterval(async () => {
            const online = await getCalculatedOnline();

            await pubsub.publish('onlineData', { online });
        }, config.app.onlineDelay);
    };
}