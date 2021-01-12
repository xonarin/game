import config from '../../config';
import pubsub from '../../data/pubsub';
import { getCalculatedOnline } from '../../data/modules/liveData/utils';
import { getGameFromQueue } from './LiveDataStorage';
import { LiveDataGameParent } from '../../data/modules/liveData/resolvers';

export default class LiveDataService {
    public initStart = async (): Promise<void> => {
        setInterval(async () => {
            const game = (await getGameFromQueue()) as LiveDataGameParent | null;
            if (game !== null) {
                await pubsub.publish('games', game);
            }
        }, config.app.lastBidDelay);

        setInterval(async () => {
            const online = await getCalculatedOnline();

            await pubsub.publish('onlineData', { online });
        }, config.app.onlineDelay);
    };
}
