import { BelongsTo, DataTypes, Model, Sequelize } from 'sequelize';

import { AssociableModelStatic } from './index';
import { User } from './User';

export interface ReferralIncome extends Model {
    readonly id: string;
    readonly referrerId: string;
    readonly referralId: string;
    readonly amount: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export type ReferralIncomeStatic = AssociableModelStatic<
    ReferralIncome,
    {
        Referrer: BelongsTo<ReferralIncome, User>;
        Referral: BelongsTo<ReferralIncome, User>;
    }
>;

export const initReferralIncome = (sequelize: Sequelize): ReferralIncomeStatic => {
    const ReferralIncome = sequelize.define('ReferralIncome', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            get(this: ReferralIncome) {
                return ((this.getDataValue('id') as unknown) as number).toString();
            },
        },

        referrerId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            get(this: ReferralIncome) {
                return ((this.getDataValue('referrerId') as unknown) as number).toString();
            },
        },

        referralId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            get(this: ReferralIncome) {
                return ((this.getDataValue('referralId') as unknown) as number).toString();
            },
        },

        amount: {
            type: DataTypes.DOUBLE(8, 2),
            allowNull: false,
        },
    }) as ReferralIncomeStatic;

    ReferralIncome.associate = database => {
        ReferralIncome.Referrer = ReferralIncome.belongsTo(database.User, { as: 'referrer' });
        ReferralIncome.Referral = ReferralIncome.belongsTo(database.User, { as: 'referral' });
    };

    return ReferralIncome;
};
