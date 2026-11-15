import { BelongsTo, DataTypes, Model, Sequelize } from 'sequelize';

import { AssociableModelStatic } from './index';
import { User } from './User';
import { Item } from './Item';

/**
 * Скин в инвентаре игрока (экземпляр предмета каталога Item). Строка есть, только пока скин у игрока:
 * поставили в игру, вывели — строка удаляется. История — в таблицах игр (UpgradeGame и т.д.).
 *
 * Один скин нельзя использовать в двух местах одновременно (две игры, игра и вывод):
 *  - мгновенная игра (апгрейд) берёт строку FOR UPDATE с lockedBy IS NULL и удаляет её в той же транзакции;
 *  - долгий процесс (вывод, многоходовые режимы) ставит резерв lockedBy атомарным
 *    UPDATE … WHERE lockedBy IS NULL, а по завершении удаляет строку или снимает резерв.
 * См. repositories/inventory.ts.
 */

export enum InventoryLockReason {
    WITHDRAW = 'WITHDRAW',
    GAME = 'GAME',
}

export interface InventoryItem extends Model {
    readonly id: string;
    readonly userId: string;
    readonly itemId: string;
    // Цена предмета в момент получения (монеты; 1 монета = 1 USD), DECIMAL приходит строкой
    readonly priceAtAcquisition: string;

    // Резерв: кем занят скин (NULL — свободен), ссылка на процесс (id вывода / игры) и когда занят
    readonly lockedBy: InventoryLockReason | null;
    readonly lockRef: string | null;
    readonly lockedAt: Date | null;

    readonly createdAt: Date;
    readonly updatedAt: Date;

    user?: User;
    item?: Item;
}

export type InventoryItemStatic = AssociableModelStatic<
    InventoryItem,
    {
        User: BelongsTo<InventoryItem, User>;
        Item: BelongsTo<InventoryItem, Item>;
    }
>;

const idGetter = (field: string) =>
    function get(this: InventoryItem) {
        const value = this.getDataValue(field) as unknown as number | null;
        return value === null || value === undefined ? value : value.toString();
    };

export const initInventoryItem = (sequelize: Sequelize): InventoryItemStatic => {
    const model = sequelize.define(
        'InventoryItem',
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                get: idGetter('id'),
            },
            userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, get: idGetter('userId') },
            itemId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, get: idGetter('itemId') },
            priceAtAcquisition: { type: DataTypes.DECIMAL(12, 2), allowNull: false },

            lockedBy: { type: DataTypes.STRING(16), allowNull: true },
            lockRef: { type: DataTypes.STRING(64), allowNull: true },
            lockedAt: { type: DataTypes.DATE, allowNull: true },
        },
        {
            tableName: 'InventoryItem',
            indexes: [{ name: 'idx_inventory_item_user_locked', fields: ['userId', 'lockedBy'] }],
        },
    ) as InventoryItemStatic;

    model.associate = database => {
        model.User = model.belongsTo(database.User, { as: 'user' });
        model.Item = model.belongsTo(database.Item, { as: 'item' });
    };

    return model;
};
