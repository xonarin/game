import { Model, BelongsTo, BelongsToGetAssociationMixin, DataTypes, Sequelize } from 'sequelize';

import { User } from './User';
import { AssociableModelStatic } from './index';

/** Audit record of an action performed by an admin in the admin panel. */
export interface AdminAction extends Model {
    readonly id: string;
    // The admin (User with role=admin) who performed the action
    readonly adminId: string;
    // Machine-readable action name, e.g. 'adjustBalance', 'updateSetting'
    readonly action: string;
    // Optional target: the affected user id (for user actions) and a free-form target key
    readonly targetUserId: string | null;
    readonly targetKey: string | null;
    // JSON snapshot of the change, e.g. { before, after, amount, reason }
    readonly details: unknown;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    readonly admin?: User;

    readonly getAdmin: BelongsToGetAssociationMixin<User>;
}

export type AdminActionStatic = AssociableModelStatic<
    AdminAction,
    {
        Admin: BelongsTo<AdminAction, User>;
    }
>;

export const initAdminAction = (sequelize: Sequelize): AdminActionStatic => {
    const model = sequelize.define(
        'AdminAction',
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,

                get(this: AdminAction) {
                    return (this.getDataValue('id') as unknown as number).toString();
                },
            },

            adminId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,

                get(this: AdminAction) {
                    return (this.getDataValue('adminId') as unknown as number).toString();
                },
            },

            action: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            targetUserId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,

                get(this: AdminAction) {
                    const value = this.getDataValue('targetUserId') as unknown as number | null;
                    return value === null || value === undefined ? null : value.toString();
                },
            },

            targetKey: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            details: {
                type: DataTypes.JSON,
                allowNull: true,
            },
        },
        {
            indexes: [{ name: 'createdAt', using: 'BTREE', fields: [{ name: 'createdAt', order: 'DESC' }] }],
        },
    ) as AdminActionStatic;

    model.associate = database => {
        model.Admin = model.belongsTo(database.User, { as: 'admin', foreignKey: 'adminId' });
    };

    return model;
};
