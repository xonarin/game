import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

export interface PaymentMethod extends Model {
    readonly id: string;
    readonly name: string;
    readonly avatar: string;
    readonly commission: number;
    readonly minAmount: number;
    readonly maxAmount: number;
    readonly enabled: boolean;
    readonly sortPayment: number;
}

export type PaymentMethodStatic = ModelStatic<PaymentMethod>;

export const initPaymentMethod = (sequelize: Sequelize): PaymentMethodStatic => {
    return sequelize.define(
        'PaymentMethod',
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,

                get(this: PaymentMethod) {
                    return ((this.getDataValue('id') as unknown) as number).toString();
                },
            },

            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            avatar: {
                type: DataTypes.STRING(1023),
                allowNull: false,
            },

            commission: {
                type: DataTypes.DOUBLE(5, 2),
                allowNull: false,
            },

            minAmount: {
                type: DataTypes.DOUBLE(8, 2),
                allowNull: false,
                defaultValue: 50,
            },

            maxAmount: {
                type: DataTypes.DOUBLE(8, 2),
                allowNull: false,
            },

            enabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },

            sortPayment: {
                type: DataTypes.DOUBLE(8, 2),
                allowNull: false,
            },
        },
        { timestamps: false },
    ) as PaymentMethodStatic;
};
