import { BelongsTo, DataTypes, HasMany, Model, Sequelize } from 'sequelize';

import { AssociableModelStatic } from './index';
import { User } from './User';
import { Item } from './Item';
import { UpgradeGameBetItem } from './UpgradeGameBetItem';

/**
 * Сыгранный апгрейд — единственный источник истории игр игрока (строки инвентаря после игры удаляются).
 * Хранит снимок ставки и цели (предметы каталога и их цены на момент игры) и всё для проверки исхода:
 * сиды и nonce, из которых получен roll, и окно выигрыша, посчитанное ДО броска.
 * Выигрыш = скин targetItemId, выданный в инвентарь, если win.
 */

export interface UpgradeGame extends Model {
    readonly id: string;
    readonly userId: string;

    // Ставка: монеты + скины (снимки — в betItems); betItemsValue — стоимость скинов, betValue — всего
    readonly betAmount: string;
    readonly betItemsValue: string;
    readonly betValue: string;

    // Цель
    readonly targetItemId: string;
    readonly targetPrice: string;

    readonly multiplier: string;
    readonly chance: string;
    readonly roll: number;
    readonly winStart: number;
    readonly winEnd: number;
    readonly win: boolean;

    readonly clientSeed: string;
    readonly serverSeed: string;
    readonly nonce: number;

    readonly createdAt: Date;

    user?: User;
    betItems?: UpgradeGameBetItem[];
    targetItem?: Item;
}

export type UpgradeGameStatic = AssociableModelStatic<
    UpgradeGame,
    {
        User: BelongsTo<UpgradeGame, User>;
        BetItems: HasMany<UpgradeGame, UpgradeGameBetItem>;
        TargetItem: BelongsTo<UpgradeGame, Item>;
    }
>;

const idGetter = (field: string) =>
    function get(this: UpgradeGame) {
        const value = this.getDataValue(field) as unknown as number | null;
        return value === null || value === undefined ? value : value.toString();
    };

export const initUpgradeGame = (sequelize: Sequelize): UpgradeGameStatic => {
    const model = sequelize.define(
        'UpgradeGame',
        {
            id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, get: idGetter('id') },
            userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, get: idGetter('userId') },

            betAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
            betItemsValue: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
            betValue: { type: DataTypes.DECIMAL(12, 2), allowNull: false },

            targetItemId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, get: idGetter('targetItemId') },
            targetPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },

            multiplier: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
            chance: { type: DataTypes.DECIMAL(8, 6), allowNull: false },
            roll: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
            winStart: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
            winEnd: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
            win: { type: DataTypes.BOOLEAN, allowNull: false },

            clientSeed: { type: DataTypes.STRING, allowNull: false },
            serverSeed: { type: DataTypes.STRING, allowNull: false },
            nonce: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        },
        {
            tableName: 'UpgradeGame',
            updatedAt: false,
            indexes: [
                { name: 'idx_upgrade_game_user', fields: ['userId', 'id'] },
                // Статистика админки за период
                { name: 'idx_upgrade_game_created', fields: ['createdAt'] },
            ],
        },
    ) as UpgradeGameStatic;

    model.associate = database => {
        model.User = model.belongsTo(database.User, { as: 'user' });
        model.BetItems = model.hasMany(database.UpgradeGameBetItem, { as: 'betItems', foreignKey: 'upgradeGameId' });
        model.TargetItem = model.belongsTo(database.Item, { as: 'targetItem', foreignKey: 'targetItemId' });
    };

    return model;
};
