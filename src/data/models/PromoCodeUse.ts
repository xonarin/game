import { BelongsTo, BelongsToGetAssociationMixin, DataTypes, Model, Sequelize } from 'sequelize';

import { User } from './User';
import { AssociableModelStatic } from './index';
import { PromoCode } from './PromoCode';

export interface PromoCodeUse extends Model {
    readonly code: string;
    readonly userId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    readonly promoCode?: PromoCode;
    readonly user?: User;

    readonly getPromoCode: BelongsToGetAssociationMixin<PromoCode>;
    readonly getUser: BelongsToGetAssociationMixin<User>;
}

export type PromoCodeUseStatic = AssociableModelStatic<
    PromoCodeUse,
    {
        PromoCode: BelongsTo<PromoCodeUse, PromoCode>;
        User: BelongsTo<PromoCodeUse, User>;
    }
>;

export const initPromoCodeUse = (sequelize: Sequelize): PromoCodeUseStatic => {
    const PromoCodeUse: PromoCodeUseStatic = sequelize.define('PromoCodeUse', {
        code: {
            type: DataTypes.STRING,
            primaryKey: true,
        },

        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,

            get(this: PromoCodeUse) {
                return ((this.getDataValue('userId') as unknown) as number).toString();
            },
        },
    }) as PromoCodeUseStatic;

    PromoCodeUse.associate = database => {
        PromoCodeUse.PromoCode = PromoCodeUse.belongsTo(database.PromoCode, { foreignKey: 'code', as: 'promoCode' });
        PromoCodeUse.User = PromoCodeUse.belongsTo(database.User, { as: 'user' });
    };

    return PromoCodeUse;
};
