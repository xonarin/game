import { inputRule } from 'graphql-shield';

export const checkPlayGameUPGArgs = inputRule()(yup =>
    yup.object({
        input: yup.object({
            betAmount: yup.number().required('UPGRADE_INVALID_BET').min(0, 'UPGRADE_INVALID_BET'),
            targetMultiplier: yup.number().required('UPGRADE_PRICE_CHANGED').moreThan(1, 'UPGRADE_PRICE_CHANGED'),
            betItemIds: yup.array().of(yup.string()).max(100, 'UPGRADE_TOO_MANY_BET_ITEMS').nullable(),
        }),
    }),
);

export const checkUpgradeItemsUPGArgs = inputRule()(yup =>
    yup.object({
        filter: yup.object({
            search: yup.string().max(100).nullable(),
            minPrice: yup.number().min(0).nullable(),
            maxPrice: yup.number().min(0).nullable(),
            limit: yup.number().integer().min(1).max(60).nullable(),
            offset: yup.number().integer().min(0).nullable(),
        }),
    }),
);

export const checkSimulateUpgradeArgs = inputRule()(yup =>
    yup.object({
        input: yup.object({
            games: yup
                .number()
                .required()
                .integer('Количество игр — целое число')
                .min(1, 'Количество игр — от 1')
                .max(1000000, 'Количество игр — не больше 1 000 000'),
            bet: yup.number().required().min(0.01, 'Ставка — от 0.01').max(1000000, 'Ставка — не больше 1 000 000'),
            chanceFrom: yup.number().required().moreThan(0, 'Шанс — больше 0 %').lessThan(1, 'Шанс — меньше 100 %'),
            chanceTo: yup.number().required().moreThan(0, 'Шанс — больше 0 %').lessThan(1, 'Шанс — меньше 100 %'),
            frontendCoef: yup.number().moreThan(0, 'RTP — больше 0 %').max(2, 'RTP — не больше 200 %').nullable(),
        }),
    }),
);

export const checkSimulatePlayersArgs = inputRule()(yup =>
    yup.object({
        input: yup.object({
            players: yup
                .number()
                .required()
                .integer('Игроков — целое число')
                .min(1, 'Игроков — от 1')
                .max(1000000, 'Игроков — не больше 1 000 000'),
            rounds: yup
                .number()
                .required()
                .integer('Раундов — целое число')
                .min(1, 'Раундов — от 1')
                .max(1000, 'Раундов — не больше 1000'),
            startBalance: yup
                .number()
                .required()
                .min(0.01, 'Баланс — от 0.01')
                .max(1000000, 'Баланс — не больше 1 000 000'),
            bet: yup.number().min(0.01, 'Ставка — от 0.01').max(1000000, 'Ставка — не больше 1 000 000').nullable(),
            chanceFrom: yup.number().required().moreThan(0, 'Шанс — больше 0 %').lessThan(1, 'Шанс — меньше 100 %'),
            chanceTo: yup.number().required().moreThan(0, 'Шанс — больше 0 %').lessThan(1, 'Шанс — меньше 100 %'),
            frontendCoef: yup.number().moreThan(0, 'RTP — больше 0 %').max(2, 'RTP — не больше 200 %').nullable(),
            cashOutGrowth: yup
                .number()
                .moreThan(0, 'Рост для вывода — больше 0 %')
                .max(1000, 'Рост для вывода — не больше 100 000 %')
                .nullable(),
        }),
    }),
);

export const checkBuyItemsUPGArgs = inputRule()(yup =>
    yup.object({
        items: yup
            .array()
            .of(
                yup.object({
                    quantity: yup
                        .number()
                        .required('SHOP_INVALID_QUANTITY')
                        .integer('SHOP_INVALID_QUANTITY')
                        .min(1, 'SHOP_INVALID_QUANTITY'),
                }),
            )
            .min(1, 'SHOP_EMPTY_CART')
            .max(50, 'SHOP_TOO_MANY_ITEMS'),
    }),
);

export const checkUpgradeHistoryUPGArgs = inputRule()(yup =>
    yup.object({
        limit: yup.number().integer().min(1).max(50).nullable(),
        offset: yup.number().integer().min(0).nullable(),
    }),
);
