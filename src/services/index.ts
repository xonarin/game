import LiveDataService from './LiveData/LiveDataService';
import { ClassicGameService } from './classicGame/classicGame';

export const initServices = () => ({
    liveData: new LiveDataService(),
    classicGame: new ClassicGameService(),
});

export const services = initServices();

export const startServices = async () => {
    const { liveData, classicGame } = services;

    await liveData.initStart();
    await classicGame.initStart();
};
