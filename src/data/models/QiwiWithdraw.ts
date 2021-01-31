import { BelongsTo, BelongsToGetAssociationMixin, Model } from 'sequelize/types';
import { DataTypes, Sequelize } from 'sequelize';

import { User } from './User';
import { AssociableModelStatic } from './index';

export interface QiwiWithdraw extends Model {
    readonly id: string;
    readonly userId: string;
    readonly methodId: string;
    readonly paymentId: string;
    readonly transactionId: string;
    readonly amount: number;
    readonly purse: string;

    user?: User;

    getUser: BelongsToGetAssociationMixin<User>;
}

export type QiwiWithdrawStatic = AssociableModelStatic<
    QiwiWithdraw,
    {
        User: BelongsTo<QiwiWithdraw, User>;
    }
>;

export const initQiwiWithdraw = (sequelize: Sequelize): QiwiWithdrawStatic => {
    const QiwiWithdraw = sequelize.define('QiwiWithdraw', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,

            get(this: QiwiWithdraw) {
                return ((this.getDataValue('id') as unknown) as number).toString();
            },
        },

        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,

            get(this: QiwiWithdraw) {
                return ((this.getDataValue('userId') as unknown) as number).toString();
            },
        },

        methodId: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        paymentId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        transactionId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        amount: {
            type: DataTypes.DOUBLE(8, 2),
            allowNull: false,
        },

        purse: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }) as QiwiWithdrawStatic;

    QiwiWithdraw.associate = database => {
        QiwiWithdraw.User = QiwiWithdraw.belongsTo(database.User, { as: 'user' });
    };

    return QiwiWithdraw;
};
