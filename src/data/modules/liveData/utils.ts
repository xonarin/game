import { getOnline } from '../../../services/LiveData/LiveDataStorage';
import { repositories } from '../../database';
import config from '../../../config';
import { ClassicGame } from '../../models/ClassicGame';
import { MinesGame } from '../../models/MinesGame';
import { getMinesCoef } from '../../../utils/mines';
import { countOnes } from '../../../utils/number';
import { moneyRound } from '../../../utils/money';

const getClassicLiveDataGame = async (game: ClassicGame) => {
    const winner = game.winner || (await game.getWinner());

    return {
        id: game.id,
        game: 'classic',
        winner: winner?.username,
        avatar: winner?.avatar,
        chance: game.winnerChance || 0,
        bet: game.winnerBetsPrice || 0,
        fund: game.fund,
        time: game.finishedAt || new Date(),
    };
};

const getMinesLiveDataGame = (game: MinesGame) => {
    // eslint-disable-next-line no-bitwise
    const isWin = !(game.fieldConf & game.stepsConf);
    const coef = getMinesCoef(game.bombsCount, countOnes(game.stepsConf)) || 0;

    return {
        id: game.id,
        game: 'mines',
        winner: game.user?.username || '',
        avatar: game.user?.avatar || '',
        chance: isWin ? coef : 0,
        bet: game.betAmount,
        fund: isWin ? moneyRound(game.betAmount * coef) : 0,
        time: game.updatedAt,
    };
};

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

export { getClassicLiveDataGame, getMinesLiveDataGame, getCalculatedOnline };
