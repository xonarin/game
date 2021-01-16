import { BelongsTo, BelongsToGetAssociationMixin, DataTypes, Model, Sequelize } from 'sequelize';

import { User } from './User';
import { AssociableModelStatic } from './index';

export enum PaymentStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    FINISHED = 'FINISHED',
}

export interface UserPayment extends Model {
    readonly id: string;
    readonly userId: string;
    readonly methodId: string;
    readonly sum: number;
    readonly commission: number;
    readonly status: PaymentStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    user?: User;

    getUser: BelongsToGetAssociationMixin<User>;
}

export type UserPaymentStatic = AssociableModelStatic<
    UserPayment,
    {
        User: BelongsTo<UserPayment, User>;
    }
>;

export const initUserPayment = (sequelize: Sequelize): UserPaymentStatic => {
    const UserPayment = sequelize.define('UserPayment', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,

            get(this: UserPayment) {
                return ((this.getDataValue('id') as unknown) as number).toString();
            },
        },

        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,

            get(this: UserPayment) {
                return ((this.getDataValue('userId') as unknown) as number).toString();
            },
        },

        methodId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,

            get(this: UserPayment) {
                return ((this.getDataValue('methodId') as unknown) as number).toString();
            },
        },

        sum: {
            type: DataTypes.DOUBLE(8, 2),
            allowNull: false,
        },

        commission: {
            type: DataTypes.DOUBLE(5, 2),
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM(...Object.values(PaymentStatus)),
            defaultValue: PaymentStatus.IN_PROGRESS,
            allowNull: false,
        },
    }) as UserPaymentStatic;

    UserPayment.associate = database => {
        UserPayment.User = UserPayment.belongsTo(database.User, { as: 'user' });
    };

    return UserPayment;
};
