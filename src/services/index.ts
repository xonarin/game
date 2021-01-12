import { ClassicGameService } from './classicGame/classicGame';
import LiveDataService from './LiveData/LiveDataService';

export const initServices = () => ({
    classicGame: new ClassicGameService(),
    liveData: new LiveDataService(),
});

export const services = initServices();

export const startServices = async () => {
    const { classicGame, liveData } = services;

    await classicGame.initStart();
    await liveData.initStart();
};
