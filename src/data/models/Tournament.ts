import { BelongsTo, DataTypes, Model, Sequelize } from 'sequelize';

import { AssociableModelStatic } from './index';
import { User } from './User';

export enum TournamentType {
    Monthly = 'Monthly',
    Activity = 'Activity',
    Referrals = 'Referrals',
}

export interface Tournament extends Model {
    readonly id: string;
    readonly type: TournamentType;
    readonly start: Date;
    readonly finish: Date;
    readonly winnerId: string | null;
    readonly isFinished: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    winner: User | null;
}

export type TournamentStatic = AssociableModelStatic<
    Tournament,
    {
        Winner: BelongsTo<Tournament, User>;
    }
>;

export const initTournament = (sequelize: Sequelize): TournamentStatic => {
    const Tournament = sequelize.define(
        'Tournament',
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                get(this: Tournament) {
                    return ((this.getDataValue('id') as unknown) as number).toString();
                },
            },
            type: {
                type: DataTypes.ENUM(...Object.values(TournamentType)),
                allowNull: false,
            },
            start: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            finish: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            winnerId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                get(this: Tournament) {
                    const winnerId = (this.getDataValue('winnerId') as unknown) as number | null;
                    return winnerId ? winnerId.toString() : null;
                },
            },
            isFinished: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
        },
        {
            indexes: [{ name: 'isFinished', using: 'BTREE', fields: [{ name: 'isFinished', order: 'ASC' }] }],
        },
    ) as TournamentStatic;

    Tournament.associate = database => {
        Tournament.Winner = Tournament.belongsTo(database.User, { as: 'winner' });
    };

    return Tournament;
};
