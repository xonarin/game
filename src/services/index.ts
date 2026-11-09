import LiveDataService from './LiveData/LiveDataService';

export const initServices = () => ({
    liveData: new LiveDataService(),
});

export const services = initServices();

export const startServices = async () => {
    const { liveData } = services;

    await liveData.initStart();
};
