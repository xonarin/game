import {
    BelongsTo,
    BelongsToGetAssociationMixin,
    BelongsToMany,
    BelongsToManyGetAssociationsMixin,
    DataTypes,
    HasMany,
    HasManyGetAssociationsMixin,
    Model,
    Sequelize,
} from 'sequelize';

import { AssociableModelStatic } from './index';
import { ReferralIncome } from './ReferralIncome';
import { Message } from './Message';
import { Chat } from './Chat';
import { ClassicGame } from './ClassicGame';
import { ClassicGameBet } from './ClassicGameBet';
import { MinesGame } from './MinesGame';

export enum SocialType {
    Steam = 'Steam',
    VK = 'VK',
}

export enum UserRole {
    Default = 'Default',
    Moderator = 'Moderator',
    Admin = 'Admin',
}

export enum RefStatus {
    Frozen = 'Frozen',
    Active = 'Active',
}

export interface User extends Model {
    readonly id: string;
    readonly socialType: SocialType;
    readonly socialId: string;
    readonly role: UserRole;
    readonly username: string;
    readonly avatar: string;
    readonly money: number;
    readonly turnover: number;
    readonly refId: string | null;
    readonly refStatus: RefStatus | null;
    readonly refMoney: number;
    readonly refPercent: number;
    readonly clientSeed: string;
    readonly serverSeed: string;
    readonly nonce: number;
    readonly chatWarns: number;
    readonly chatWarnsUpdatedAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    getReferrer: BelongsToGetAssociationMixin<User>;
    getReferrals: HasManyGetAssociationsMixin<User>;
    getChats: BelongsToManyGetAssociationsMixin<Chat>;
    getMessages: HasManyGetAssociationsMixin<Message>;
    getWonClassicGames: HasManyGetAssociationsMixin<ClassicGame>;
    getClassicGameBets: HasManyGetAssociationsMixin<ClassicGameBet>;
}

export type UserStatic = AssociableModelStatic<
    User,
    {
        Referrer: BelongsTo<User, User>;
        Referral: HasMany<User, User>;
        ReferrerIncome: HasMany<User, ReferralIncome>;
        ReferralIncome: HasMany<User, ReferralIncome>;
        Chat: BelongsToMany<User, Chat>;
        Message: HasMany<User, Message>;
        WonClassicGame: HasMany<User, ClassicGame>;
        ClassicGameBet: HasMany<User, ClassicGameBet>;
        MinesGame: HasMany<User, MinesGame>;
    }
>;

export const initUser = (sequelize: Sequelize): UserStatic => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                get(this: User) {
                    return ((this.getDataValue('id') as unknown) as number).toString();
                },
            },

            socialType: {
                type: DataTypes.ENUM(...Object.values(SocialType)),
                allowNull: false,
            },

            socialId: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            role: {
                type: DataTypes.ENUM(...Object.values(UserRole)),
                allowNull: false,
                defaultValue: UserRole.Default,
            },

            username: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            avatar: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            money: {
                type: DataTypes.DOUBLE(8, 2),
                allowNull: false,
                defaultValue: 0,
            },

            turnover: {
                type: DataTypes.DOUBLE(8, 2),
                allowNull: false,
                defaultValue: 0,
            },

            refId: {
                type: DataTypes.INTEGER.UNSIGNED,
                get(this: User) {
                    const refId = (this.getDataValue('refId') as unknown) as number | null;
                    return typeof refId === 'number' ? refId.toString() : null;
                },
            },

            refStatus: {
                type: DataTypes.ENUM(...Object.values(RefStatus)),
            },

            refMoney: {
                type: DataTypes.DOUBLE(8, 2),
                allowNull: false,
                defaultValue: 0,
            },

            refPercent: {
                type: DataTypes.DOUBLE(8, 2),
                allowNull: false,
                defaultValue: 3,
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
                defaultValue: 0,
            },

            chatWarns: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },

            chatWarnsUpdatedAt: {
                type: DataTypes.DATE,
            },
        },
        {
            indexes: [{ name: 'createdAt', using: 'BTREE', fields: [{ name: 'createdAt', order: 'ASC' }] }],
        },
    ) as UserStatic;

    User.associate = database => {
        User.Referrer = User.belongsTo(database.User, { as: 'referrer', foreignKey: 'refId' });
        User.Referral = User.hasMany(database.User, { as: 'referrals', foreignKey: 'refId' });
        User.ReferrerIncome = User.hasMany(database.ReferralIncome, {
            as: 'referrerIncomes',
            foreignKey: 'referralId',
        });
        User.ReferralIncome = User.hasMany(database.ReferralIncome, {
            as: 'referralIncomes',
            foreignKey: 'referrerId',
        });
        User.Chat = User.belongsToMany(database.Chat, {
            as: 'chats',
            through: database.ChatUser,
            foreignKey: 'userId',
        });
        User.Message = User.hasMany(database.Message, { as: 'messages', foreignKey: 'senderId' });
        User.WonClassicGame = User.hasMany(database.ClassicGame, { as: 'wonClassicGames', foreignKey: 'winnerId' });
        User.ClassicGameBet = User.hasMany(database.ClassicGameBet, { as: 'classicGameBets', foreignKey: 'userId' });
    };

    return User;
};
