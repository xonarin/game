import {
    BelongsTo,
    BelongsToGetAssociationMixin,
    DataTypes,
    HasMany,
    HasManyGetAssociationsMixin,
    Model,
    Sequelize,
} from 'sequelize';

import { AssociableModelStatic } from './index';
import { User } from './User';
import { ClassicGameBet } from './ClassicGameBet';

export enum ClassicGameState {
    Waiting = 'Waiting',
    Countdown = 'Countdown',
    Culmination = 'Culmination',
    Ended = 'Ended',
}

export interface ClassicGame extends Model {
    readonly id: string;
    readonly commission: number;
    readonly state: ClassicGameState;
    readonly randomNumber: string;
    readonly hash: string;
    readonly fund: number;
    readonly winnerId: string | null;
    readonly winnerTicket: number | null;
    readonly winnerBetsPrice: number | null;
    readonly winnerChance: number | null;
    readonly finishedAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    winner?: User;
    bets?: ClassicGameBet[];

    getWinner: BelongsToGetAssociationMixin<User>;
    getBets: HasManyGetAssociationsMixin<ClassicGameBet>;
}

export interface HistoryClassicGame extends ClassicGame {
    readonly winnerId: string;
    readonly winnerTicket: number;
    readonly winnerBetsPrice: number;
    readonly winnerChance: number;
    readonly finishedAt: Date;

    winner: User;
}

export type ClassicGameStatic = AssociableModelStatic<
    ClassicGame,
    {
        Winner: BelongsTo<ClassicGame, User>;
        Bet: HasMany<ClassicGame, ClassicGameBet>;
    }
>;

export const initClassicGame = (sequelize: Sequelize): ClassicGameStatic => {
    const ClassicGame = sequelize.define('ClassicGame', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            get(this: ClassicGame) {
                return ((this.getDataValue('id') as unknown) as number).toString();
            },
        },

        commission: {
            type: DataTypes.DOUBLE(5, 2),
            allowNull: false,
        },

        state: {
            type: DataTypes.ENUM(...Object.values(ClassicGameState)),
            allowNull: false,
            defaultValue: ClassicGameState.Waiting,
        },

        randomNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        fund: {
            type: DataTypes.DOUBLE(8, 2),
            allowNull: false,
            defaultValue: 0,
        },

        winnerId: {
            type: DataTypes.INTEGER.UNSIGNED,
            get(this: ClassicGame) {
                const winnerId = (this.getDataValue('winnerId') as unknown) as number | null;
                return winnerId ? winnerId.toString() : null;
            },
        },

        winnerTicket: {
            type: DataTypes.INTEGER.UNSIGNED,
        },

        winnerBetsPrice: {
            type: DataTypes.DOUBLE(8, 2),
        },

        winnerChance: {
            type: DataTypes.DOUBLE(4, 1),
        },

        finishedAt: {
            type: DataTypes.DATE,
        },
    }) as ClassicGameStatic;

    ClassicGame.associate = database => {
        ClassicGame.Winner = ClassicGame.belongsTo(database.User, { as: 'winner' });
        ClassicGame.Bet = ClassicGame.hasMany(database.ClassicGameBet, { as: 'bets', foreignKey: 'gameId' });
    };

    return ClassicGame;
};
