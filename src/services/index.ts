import { ClassicGameService } from './classicGame/classicGame';

export const initServices = () => ({
    classicGame: new ClassicGameService(),
});

export const services = initServices();

export const startServices = async () => {
    const { classicGame } = services;

    await classicGame.initStart();
};
