import { BelongsTo, BelongsToGetAssociationMixin, DataTypes, Model, Sequelize } from 'sequelize';

import { AssociableModelStatic } from './index';
import { ClassicGame } from './ClassicGame';
import { User } from './User';

export interface Winners extends Model {
    readonly id: string;
    readonly gameId: string;
    readonly userId: string;
    readonly amount: number;
    readonly firstTicket: number;
    readonly lastTicket: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    user?: User;

    getUser: BelongsToGetAssociationMixin<User>;
    getGame: BelongsToGetAssociationMixin<ClassicGame>;
}

export type WinnersStatic = AssociableModelStatic<
    Winners,
    {
        User: BelongsTo<Winners, User>;
        Game: BelongsTo<Winners, ClassicGame>;
    }
>;

export const initWinners = (sequelize: Sequelize): WinnersStatic => {
    const Winners = sequelize.define('Winners', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            get(this: Winners) {
                return ((this.getDataValue('id') as unknown) as number).toString();
            },
        },

        gameId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            get(this: Winners) {
                return ((this.getDataValue('gameId') as unknown) as number).toString();
            },
        },

        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            get(this: Winners) {
                return ((this.getDataValue('userId') as unknown) as number).toString();
            },
        },

        amount: {
            type: DataTypes.DOUBLE(8, 2),
            allowNull: false,
        },
    }) as WinnersStatic;

    Winners.associate = database => {
        Winners.User = Winners.belongsTo(database.User, { as: 'user' });
        Winners.Game = Winners.belongsTo(database.ClassicGame, { as: 'game' });
    };
    Winners.sync({ force: true });
    return Winners;
};
