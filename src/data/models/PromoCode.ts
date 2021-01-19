import { BelongsTo, BelongsToGetAssociationMixin, DataTypes, Model, Sequelize } from 'sequelize';

import { User } from './User';
import { AssociableModelStatic } from './index';

export interface PromoCode extends Model {
    readonly code: string;
    readonly userId: string;
    readonly amount: number;
    readonly maxUses: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    readonly user?: User;

    readonly getUser: BelongsToGetAssociationMixin<User>;
}

export type PromoCodeStatic = AssociableModelStatic<
    PromoCode,
    {
        User: BelongsTo<PromoCode, User>;
    }
>;

export const initPromoCode = (sequelize: Sequelize): PromoCodeStatic => {
    const PromoCode: PromoCodeStatic = sequelize.define('PromoCode', {
        code: {
            type: DataTypes.STRING,
            primaryKey: true,
        },

        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,

            get(this: PromoCode) {
                return ((this.getDataValue('userId') as unknown) as number).toString();
            },
        },

        amount: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },

        maxUses: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
    }) as PromoCodeStatic;

    PromoCode.associate = database => {
        PromoCode.User = PromoCode.belongsTo(database.User, { as: 'user' });
    };

    return PromoCode;
};
