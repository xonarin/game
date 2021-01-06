import { getOnline } from '../../../services/LiveData/LiveDataStorage';
import { repositories } from '../../database';
import config from '../../../config';

const getCalculatedOnline = async (): Promise<number> => {
    const online = await getOnline();
    const fakeOnlineString = await repositories.settings.getSettingAsString('app::fakeOnline');
    const fakeOnlinePair = fakeOnlineString.split(',');
    const fakeOnline = fakeOnlinePair.map(pair => {
        const [time, additionalOnline] = pair.split(':');
        return { time: parseInt(time, 10), online: parseInt(additionalOnline, 10) };
    });

    const nowHour = new Date().getHours();
    const interval = fakeOnline.find(item => nowHour < item.time);
    const additionalOnline = interval ? interval.online : 0;
    return (
        online +
        additionalOnline * (1 - config.app.additionalOnlineK) +
        Math.round(Math.random() * additionalOnline * config.app.additionalOnlineK)
    );
};

export { getCalculatedOnline };