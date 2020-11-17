import { BelongsTo, BelongsToGetAssociationMixin, DataTypes, Model, Sequelize } from 'sequelize';

import { AssociableModelStatic } from './index';
import { Chat } from './Chat';
import { User } from './User';

export interface Message extends Model {
    readonly id: string;
    readonly chatId: string;
    readonly senderId: string;
    readonly number: number;
    readonly message: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date;

    getChat: BelongsToGetAssociationMixin<Chat>;
    getSender: BelongsToGetAssociationMixin<User>;
}

export type MessageStatic = AssociableModelStatic<
    Message,
    {
        Chat: BelongsTo<Message, Chat>;
        Sender: BelongsTo<Message, User>;
    }
>;

export const initMessage = (sequelize: Sequelize): MessageStatic => {
    const Message = sequelize.define(
        'Message',
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                get(this: Message) {
                    return ((this.getDataValue('id') as unknown) as number).toString();
                },
            },

            chatId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                get(this: Message) {
                    return ((this.getDataValue('chatId') as unknown) as number).toString();
                },
            },

            senderId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                get(this: Message) {
                    return ((this.getDataValue('senderId') as unknown) as number).toString();
                },
            },

            number: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            message: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        {
            paranoid: true,
            indexes: [
                { name: 'number', using: 'BTREE', fields: [{ name: 'number', order: 'DESC' }] },
                { name: 'createdAt', using: 'BTREE', fields: [{ name: 'createdAt', order: 'DESC' }] },
            ],
        },
    ) as MessageStatic;

    Message.associate = database => {
        Message.Chat = Message.belongsTo(database.Chat, { as: 'chat' });
        Message.Sender = Message.belongsTo(database.User, { as: 'sender' });
    };

    return Message;
};
