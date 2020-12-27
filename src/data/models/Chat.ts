import {
    BelongsToMany,
    BelongsToManyAddAssociationMixin,
    BelongsToManyGetAssociationsMixin,
    BelongsToManyHasAssociationMixin,
    DataTypes,
    HasMany,
    HasManyGetAssociationsMixin,
    Model,
    Sequelize,
} from 'sequelize';

import { AssociableModelStatic } from './index';
import { User, UserRole } from './User';
import { Message } from './Message';

export enum ChatType {
    Game = 'Game',
    Pm = 'Pm',
    AdminAnnouncements = 'AdminAnnouncements',
}

export interface Chat extends Model {
    readonly id: string;
    readonly type: ChatType;
    readonly title: string | null;
    readonly image: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    readonly members?: User[];

    getMembers: BelongsToManyGetAssociationsMixin<User>;
    addMember: BelongsToManyAddAssociationMixin<User, User>;
    hasMember: BelongsToManyHasAssociationMixin<User, User>;
    getMessages: HasManyGetAssociationsMixin<Message>;

    canRead: (user?: User) => Promise<boolean>;
    canWrite: (user?: User) => Promise<boolean>;
    getTarget: (excludeIds?: User['id'][]) => Promise<User['id'][] | undefined>;
}

export type ChatStatic = AssociableModelStatic<
    Chat,
    {
        Member: BelongsToMany<Chat, User>;
        Message: HasMany<Chat, Message>;
    }
>;

export const initChat = (sequelize: Sequelize): ChatStatic => {
    const Chat = sequelize.define('Chat', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            get(this: Chat) {
                return ((this.getDataValue('id') as unknown) as number).toString();
            },
        },

        type: {
            type: DataTypes.ENUM(...Object.values(ChatType)),
            allowNull: false,
        },

        title: {
            type: DataTypes.STRING,
        },

        image: {
            type: DataTypes.STRING,
        },
    }) as ChatStatic;

    Chat.associate = database => {
        Chat.Member = Chat.belongsToMany(database.User, {
            as: 'members',
            through: database.ChatUser,
            foreignKey: 'chatId',
        });
        Chat.Message = Chat.hasMany(database.Message, { as: 'messages', foreignKey: 'chatId' });
    };

    Chat.prototype.canRead = async function canRead(this: Chat, user?: User): Promise<boolean> {
        return this.type !== ChatType.Pm || (user && this.hasMember(user));
    };

    Chat.prototype.canWrite = async function canWrite(this: Chat, user?: User): Promise<boolean> {
        return this.type === ChatType.AdminAnnouncements
            ? Boolean(user && user.role === UserRole.Admin)
            : this.canRead(user);
    };

    Chat.prototype.getTarget = async function getTarget(
        this: Chat,
        excludeIds?: User['id'][],
    ): Promise<User['id'][] | undefined> {
        if (this.type !== ChatType.Game) {
            const members: User[] = await this.getMembers();
            const memberIds: User['id'][] = members.map(member => member.id);

            if (excludeIds) {
                const excludeIdsSet = new Set(excludeIds);
                return memberIds.filter(id => !excludeIdsSet.has(id));
            }

            return memberIds;
        }

        return undefined;
    };

    return Chat;
};
