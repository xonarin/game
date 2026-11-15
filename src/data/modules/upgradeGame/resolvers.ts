import { and, IRules } from 'graphql-shield';

import { ApolloContext } from '../../../interfaces/apollo';
import { database } from '../../database';
import { InventoryItem } from '../../models/InventoryItem';
import { Item } from '../../models/Item';
import { UpgradeGame } from '../../models/UpgradeGame';
import { UpgradeGameBetItem } from '../../models/UpgradeGameBetItem';
import {
    BuyItemsEntry,
    inventoryItemValue,
    ItemsFilterUPG,
    PlayUpgradeInput,
    PlayUpgradeResult,
} from '../../repositories/upgradeGames';
import { ROLL_RANGE } from '../../../services/upgrade/game';
import { sha256Hash } from '../../../utils/crypto';
import { isAuth } from '../rules';
import {
    checkBuyItemsUPGArgs,
    checkPlayGameUPGArgs,
    checkUpgradeHistoryUPGArgs,
    checkUpgradeItemsUPGArgs,
} from './rules';

export const rules: IRules = {
    Query: {
        upgradeConfigUPG: isAuth,
        inventoryUPG: isAuth,
        upgradeItemsUPG: and(isAuth, checkUpgradeItemsUPGArgs),
        upgradeItemUPG: isAuth,
        upgradeHistoryUPG: and(isAuth, checkUpgradeHistoryUPGArgs),
    },
    Mutation: {
        playGameUPG: and(isAuth, checkPlayGameUPGArgs),
        buyItemsUPG: and(isAuth, checkBuyItemsUPGArgs),
    },
};

// Ответ playGameUPG: игра + выигранный скин + id скина ставки, ушедшего из инвентаря
type PlayPayloadParent = PlayUpgradeResult & { spentItemIds: string[] };

export const resolvers = {
    Query: {
        upgradeConfigUPG: async (_0: unknown, _1: unknown, { repositories }: ApolloContext) => ({
            ...(await repositories.upgradeGames.getConfig()),
            rollRange: ROLL_RANGE,
        }),

        inventoryUPG: (_0: unknown, _1: unknown, { user, repositories }: ApolloContext) =>
            repositories.inventory.list(user!.id),

        upgradeItemsUPG: (_0: unknown, { filter }: { filter: ItemsFilterUPG }, { repositories }: ApolloContext) =>
            repositories.upgradeGames.getItems(filter),

        upgradeItemUPG: (_0: unknown, { id }: { id: string }, { repositories }: ApolloContext) =>
            repositories.upgradeGames.getAvailableItem(id),

        upgradeHistoryUPG: (
            _0: unknown,
            { limit, offset }: { limit?: number | null; offset?: number | null },
            { user, repositories }: ApolloContext,
        ) => repositories.upgradeGames.getHistory(user!.id, limit ?? undefined, offset ?? undefined),
    },

    Mutation: {
        playGameUPG: async (
            _0: unknown,
            { input }: { input: PlayUpgradeInput },
            { user, repositories }: ApolloContext,
        ): Promise<PlayPayloadParent> => ({
            ...(await repositories.upgradeGames.play(user!.id, input)),
            spentItemIds: input.betItemIds ?? [],
        }),

        buyItemsUPG: (_0: unknown, { items }: { items: BuyItemsEntry[] }, { user, repositories }: ApolloContext) =>
            repositories.upgradeGames.buyItems(user!.id, items),
    },

    ItemUPG: {
        name: (item: Item) => item.marketHashName,
        imageUrl: (item: Item) => item.image,
        price: (item: Item) => Number(item.price),
    },

    InventoryItemUPG: {
        item: async (inventoryItem: InventoryItem) =>
            inventoryItem.item ?? database.Item.findByPk(inventoryItem.itemId),
        priceAtAcquisition: (inventoryItem: InventoryItem) => Number(inventoryItem.priceAtAcquisition),
        value: inventoryItemValue,
        // У только что созданной строки поля нет (undefined), у прочитанной из БД — null
        locked: (inventoryItem: InventoryItem) => Boolean(inventoryItem.lockedBy),
    },

    PlayGameUPGPayload: {
        gameId: ({ game }: PlayPayloadParent) => game.id,
        win: ({ game }: PlayPayloadParent) => game.win,
        roll: ({ game }: PlayPayloadParent) => game.roll,
        winStart: ({ game }: PlayPayloadParent) => game.winStart,
        winEnd: ({ game }: PlayPayloadParent) => game.winEnd,
        chance: ({ game }: PlayPayloadParent) => Number(game.chance),
        multiplier: ({ game }: PlayPayloadParent) => Number(game.multiplier),
        serverSeedHash: ({ game }: PlayPayloadParent) => sha256Hash(game.serverSeed),
        clientSeed: ({ game }: PlayPayloadParent) => game.clientSeed,
        nonce: ({ game }: PlayPayloadParent) => game.nonce,
        wonItemId: ({ wonInventoryItem }: PlayPayloadParent) => wonInventoryItem?.id ?? null,
        wonItem: ({ wonInventoryItem }: PlayPayloadParent) => wonInventoryItem,
        spentItemIds: ({ spentItemIds }: PlayPayloadParent) => spentItemIds,
    },

    UpgradeBetItemUPG: {
        item: (betItem: UpgradeGameBetItem) => betItem.item ?? database.Item.findByPk(betItem.itemId),
        value: (betItem: UpgradeGameBetItem) => Number(betItem.value),
    },

    UpgradeGameUPG: {
        betAmount: (game: UpgradeGame) => Number(game.betAmount),
        betItems: (game: UpgradeGame) => game.betItems ?? [],
        betItemsValue: (game: UpgradeGame) => Number(game.betItemsValue),
        betValue: (game: UpgradeGame) => Number(game.betValue),
        targetItem: (game: UpgradeGame) => game.targetItem ?? database.Item.findByPk(game.targetItemId),
        targetPrice: (game: UpgradeGame) => Number(game.targetPrice),
        multiplier: (game: UpgradeGame) => Number(game.multiplier),
        chance: (game: UpgradeGame) => Number(game.chance),
        serverSeedHash: (game: UpgradeGame) => sha256Hash(game.serverSeed),
        // Пока сид активен, его раскрытие позволило бы посчитать следующие броски
        serverSeed: (game: UpgradeGame, _1: unknown, { user }: ApolloContext) =>
            user && user.serverSeed !== game.serverSeed ? game.serverSeed : null,
    },
};
