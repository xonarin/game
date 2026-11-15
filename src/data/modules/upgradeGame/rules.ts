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
