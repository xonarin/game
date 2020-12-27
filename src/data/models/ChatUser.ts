import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

export interface ChatUser extends Model {
    // Can't define custom getters for chatId and userId fields because of a undefined reason.
    readonly chatId: number;
    readonly userId: number;
    readonly title: string | null;
    readonly image: string | null;
    readonly readMessageNumber: number;
}

export type ChatUserStatic = ModelStatic<ChatUser>;

export const initChatUser = (sequelize: Sequelize): ChatUserStatic => {
    return sequelize.define(
        'ChatUser',
        {
            chatId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },

            userId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },

            title: {
                type: DataTypes.STRING,
            },

            image: {
                type: DataTypes.STRING,
            },

            readMessageNumber: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        { timestamps: false },
    ) as ChatUserStatic;
};
