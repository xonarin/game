import { BelongsTo, BelongsToGetAssociationMixin, DataTypes, Model, Sequelize } from 'sequelize';

import { AssociableModelStatic } from './index';
import { ClassicGame } from './ClassicGame';
import { User } from './User';

export interface ClassicGameBet extends Model {
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

export type ClassicGameBetStatic = AssociableModelStatic<
    ClassicGameBet,
    {
        User: BelongsTo<ClassicGameBet, User>;
        Game: BelongsTo<ClassicGameBet, ClassicGame>;
    }
>;

export const initClassicGameBet = (sequelize: Sequelize): ClassicGameBetStatic => {
    const ClassicGameBet = sequelize.define('ClassicGameBet', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            get(this: ClassicGameBet) {
                return ((this.getDataValue('id') as unknown) as number).toString();
            },
        },

        gameId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            get(this: ClassicGameBet) {
                return ((this.getDataValue('gameId') as unknown) as number).toString();
            },
        },

        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            get(this: ClassicGameBet) {
                return ((this.getDataValue('userId') as unknown) as number).toString();
            },
        },

        amount: {
            type: DataTypes.DOUBLE(8, 2),
            allowNull: false,
        },

        firstTicket: {
            type: DataTypes.INTEGER.UNSIGNED,
        },

        lastTicket: {
            type: DataTypes.INTEGER.UNSIGNED,
        },
    }) as ClassicGameBetStatic;

    ClassicGameBet.associate = database => {
        ClassicGameBet.User = ClassicGameBet.belongsTo(database.User, { as: 'user' });
        ClassicGameBet.Game = ClassicGameBet.belongsTo(database.ClassicGame, { as: 'game' });
    };

    return ClassicGameBet;
};
