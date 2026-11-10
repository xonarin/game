import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

/**
 * A site allowed to use the central auth broker (src/authservice). The broker checks the
 * incoming `from` origin against the enabled rows; the admin panel manages this list.
 */
export interface AuthClient extends Model {
    readonly id: string;
    // Allowed origin, e.g. https://plant.cash (scheme + host [+ port]), no trailing slash
    readonly origin: string;
    readonly label: string | null;
    readonly enabled: boolean;
    // Optional per-site secret for /verify; falls back to the shared secret when null
    readonly secret: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export type AuthClientStatic = ModelStatic<AuthClient>;

export const initAuthClient = (sequelize: Sequelize): AuthClientStatic =>
    sequelize.define('AuthClient', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,

            get(this: AuthClient) {
                return (this.getDataValue('id') as unknown as number).toString();
            },
        },

        origin: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        label: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        secret: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }) as AuthClientStatic;
