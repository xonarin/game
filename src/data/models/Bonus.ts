import { Model } from 'sequelize/types';
import { BelongsTo, BelongsToGetAssociationMixin, DataTypes, Sequelize } from 'sequelize';

import { User } from './User';
import { AssociableModelStatic } from './index';

export interface Bonus extends Model {
    readonly id: string;
    readonly userId: string;
    readonly amount: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    readonly user?: User;

    readonly getUser: BelongsToGetAssociationMixin<User>;
}

export type BonusStatic = AssociableModelStatic<
    Bonus,
    {
        User: BelongsTo<Bonus, User>;
    }
>;

export const initBonus = (sequelize: Sequelize): BonusStatic => {
    const Bonus = sequelize.define(
        'Bonus',
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,

                get(this: Bonus) {
                    return ((this.getDataValue('id') as unknown) as number).toString();
                },
            },

            userId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,

                get(this: Bonus) {
                    return ((this.getDataValue('userId') as unknown) as number).toString();
                },
            },

            amount: {
                type: DataTypes.DOUBLE(3, 2),
                allowNull: false,
            },
        },
        {
            indexes: [{ name: 'createdAt', using: 'BTREE', fields: [{ name: 'createdAt', order: 'DESC' }] }],
        },
    ) as BonusStatic;

    Bonus.associate = database => {
        Bonus.User = Bonus.belongsTo(database.User, { as: 'user' });
    };

    return Bonus;
};
