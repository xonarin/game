import { BelongsTo, DataTypes, Model, Sequelize } from 'sequelize';

import { AssociableModelStatic } from './index';
import { Item } from './Item';

/**
 * Скин, поставленный в апгрейд: снимок предмета каталога и его стоимости в ставке на момент игры.
 * У одной игры может быть несколько скинов (UpgradeGame.betItems); строка инвентаря к этому моменту удалена.
 */

export interface UpgradeGameBetItem extends Model {
    readonly id: string;
    readonly upgradeGameId: string;
    readonly itemId: string;
    // Стоимость скина в ставке (монеты), DECIMAL строкой
    readonly value: string;

    item?: Item;
}

export type UpgradeGameBetItemStatic = AssociableModelStatic<
    UpgradeGameBetItem,
    {
        Item: BelongsTo<UpgradeGameBetItem, Item>;
    }
>;

const idGetter = (field: string) =>
    function get(this: UpgradeGameBetItem) {
        const value = this.getDataValue(field) as unknown as number | null;
        return value === null || value === undefined ? value : value.toString();
    };

export const initUpgradeGameBetItem = (sequelize: Sequelize): UpgradeGameBetItemStatic => {
    const model = sequelize.define(
        'UpgradeGameBetItem',
        {
            id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, get: idGetter('id') },
            upgradeGameId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, get: idGetter('upgradeGameId') },
            itemId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, get: idGetter('itemId') },
            value: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        },
        { tableName: 'UpgradeGameBetItem', timestamps: false },
    ) as UpgradeGameBetItemStatic;

    model.associate = database => {
        model.Item = model.belongsTo(database.Item, { as: 'item', foreignKey: 'itemId' });
    };

    return model;
};
