import { BelongsTo, BelongsToGetAssociationMixin, DataTypes, Model, Sequelize } from 'sequelize';

import { AssociableModelStatic } from './index';
import { User } from './User';

export enum MinesGameStatus {
    InGame = 'InGame',
    Ended = 'Ended',
}

export interface MinesGame extends Model {
    readonly id: string;
    readonly userId: string;
    readonly betAmount: number;
    readonly bombsCount: number;
    readonly fieldConf: number;
    readonly stepsConf: number;
    readonly forcedBombStep: number | null;
    readonly coefficient: number;
    readonly status: MinesGameStatus;
    readonly clientSeed: string;
    readonly serverSeed: string;
    readonly nonce: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    user?: User;

    getUser: BelongsToGetAssociationMixin<User>;
}

export type MinesGameStatic = AssociableModelStatic<
    MinesGame,
    {
        User: BelongsTo<MinesGame, User>;
    }
>;

export const initMinesGame = (sequelize: Sequelize): MinesGameStatic => {
    const MinesGame = sequelize.define('MinesGame', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            get(this: MinesGame) {
                return ((this.getDataValue('id') as unknown) as number).toString();
            },
        },

        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            get(this: MinesGame) {
                return ((this.getDataValue('userId') as unknown) as number).toString();
            },
        },

        betAmount: {
            type: DataTypes.DOUBLE(8, 2),
            allowNull: false,
        },

        bombsCount: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },

        fieldConf: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },

        stepsConf: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },

        forcedBombStep: {
            type: DataTypes.INTEGER.UNSIGNED,
        },

        coefficient: {
            type: DataTypes.DOUBLE(10, 2),
        },

        status: {
            type: DataTypes.ENUM(...Object.values(MinesGameStatus)),
            allowNull: false,
            defaultValue: MinesGameStatus.InGame,
        },

        clientSeed: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        serverSeed: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        nonce: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
    }) as MinesGameStatic;

    MinesGame.associate = database => {
        MinesGame.User = MinesGame.belongsTo(database.User, { as: 'user' });
    };

    return MinesGame;
};
