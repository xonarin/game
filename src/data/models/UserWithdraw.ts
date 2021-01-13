import { BelongsTo, BelongsToGetAssociationMixin, DataTypes, Model, Sequelize } from 'sequelize';

import { User } from './User';
import { AssociableModelStatic } from './index';

export enum WithdrawStatus {
    WAIT_APPROVE = 'WAIT_APPROVE',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    IN_PROGRESS = 'IN_PROGRESS',
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
    CANCELLED = 'CANCELLED',
}

export interface UserWithdraw extends Model {
    readonly id: string;
    readonly userId: string;
    readonly methodId: string;
    readonly sum: number;
    readonly status: WithdrawStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    user?: User;

    getUser: BelongsToGetAssociationMixin<User>;
}

export type UserWithdrawStatic = AssociableModelStatic<
    UserWithdraw,
    {
        User: BelongsTo<UserWithdraw, User>;
    }
>;

export const initUserWithdraw = (sequelize: Sequelize): UserWithdrawStatic => {
    const UserWithdraw = sequelize.define('UserWithdraw', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,

            get(this: UserWithdraw) {
                return ((this.getDataValue('id') as unknown) as number).toString();
            },
        },

        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,

            get(this: UserWithdraw) {
                return ((this.getDataValue('userId') as unknown) as number).toString();
            },
        },

        methodId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,

            get(this: UserWithdraw) {
                return ((this.getDataValue('methodId') as unknown) as number).toString();
            },
        },

        sum: {
            type: DataTypes.DOUBLE(8, 2),
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM(...Object.values(WithdrawStatus)),
            defaultValue: WithdrawStatus.IN_PROGRESS,
            allowNull: false,
        },
    }) as UserWithdrawStatic;

    UserWithdraw.associate = database => {
        UserWithdraw.User = UserWithdraw.belongsTo(database.User, { as: 'user' });
    };

    return UserWithdraw;
};
