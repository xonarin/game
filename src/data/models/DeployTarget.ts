import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

/**
 * A deployable app instance (a VPS running game/admin/auth, or a game mirror). The deploy panel
 * reads its /version and, in phase 2, calls its deploy agent. Managed from the admin panel.
 */
export interface DeployTarget extends Model {
    readonly id: string;
    readonly name: string;
    // 'game' | 'admin' | 'auth' — which app this instance runs (mirrors use 'game')
    readonly role: string;
    // Private base URL for /version and /health, e.g. http://10.0.0.2:3100
    readonly versionUrl: string;
    // Deploy agent base URL (phase 2), e.g. http://10.0.0.2:9000
    readonly deployUrl: string | null;
    readonly enabled: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export type DeployTargetStatic = ModelStatic<DeployTarget>;

export const initDeployTarget = (sequelize: Sequelize): DeployTargetStatic =>
    sequelize.define('DeployTarget', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,

            get(this: DeployTarget) {
                return (this.getDataValue('id') as unknown as number).toString();
            },
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        role: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        versionUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        deployUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }) as DeployTargetStatic;
