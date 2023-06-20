import { Op, Transaction } from 'sequelize';

import BaseRepository from './base';
import { UserError } from '../../utils/errors';
import { Chat, ChatType } from '../models/Chat';
import { ChatUser } from '../models/ChatUser';

class ChatsRepository extends BaseRepository {
    static CHATS_LIMIT = 10;

    async getChatById(chatId: string): Promise<Chat | null> {
        return this.db.Chat.findByPk(chatId, {
            ...this.sequelizeContext,
            rejectOnEmpty: false,
        });
    }

    async getChatByIdStrict(chatId: string): Promise<Chat> {
        const chat = await this.getChatById(chatId);

        if (!chat) {
            throw new UserError('NO_CHAT');
        }

        return chat;
    }

    async getChatUser(chatId: string, userId: string): Promise<ChatUser | null> {
        return this.db.ChatUser.findOne({ where: { chatId, userId } });
    }

    async getAdminAnnouncementsChat(transaction?: Transaction): Promise<Chat> {
        let chat: Chat | null = await this.db.Chat.findOne({
            where: { type: ChatType.AdminAnnouncements },
            transaction,
        });

        if (!chat) {
            chat = await this.createAdminAnnouncementsChat(transaction);
        }

        return chat;
    }

    async getAllGameChats(): Promise<Chat[]> {
        return this.db.Chat.findAll({ where: { type: ChatType.Game } });
    }

    async getAllUserChats(userId: string, search?: string, offset?: number): Promise<Chat[]> {
        const filterOptions = search
            ? {
                  where: {
                      title: {
                          [Op.or]: {
                              [Op.eq]: null,
                              [Op.like]: `%${search}%`,
                          },
                      },
                  },
              }
            : {};

        return this.db.Chat.findAll({
            where: {
                type: [ChatType.Pm, ChatType.AdminAnnouncements],
                ...filterOptions.where,
            },
            include: [
                {
                    association: this.db.Chat.Member,
                    where: { id: userId },
                    through: filterOptions,
                },
            ],
            order: [
                ['updatedAt', 'DESC'],
                ['id', 'DESC'],
            ],
            limit: ChatsRepository.CHATS_LIMIT,
            offset,
        });
    }

    async countAllUserChats(userId: string, search?: string): Promise<number> {
        const filterOptions = search
            ? {
                  where: {
                      title: {
                          [Op.or]: {
                              [Op.eq]: null,
                              [Op.like]: `%${search}%`,
                          },
                      },
                  },
              }
            : {};

        return this.db.Chat.count({
            where: {
                type: ChatType.Pm,
                ...filterOptions.where,
            },
            include: [
                {
                    association: this.db.Chat.Member,
                    where: { id: userId },
                    through: filterOptions,
                },
            ],
        });
    }

    async createGameChatIfNotExist(): Promise<Chat> {
        const chat: Chat | null = await this.db.Chat.findOne({ where: { type: ChatType.Game } });

        if (!chat) {
            return this.db.Chat.create({ type: ChatType.Game });
        }

        return chat;
    }

    async createAdminAnnouncementsChat(transaction?: Transaction): Promise<Chat> {
        return this.db.Chat.create(
            {
                type: ChatType.AdminAnnouncements,
                title: await this.repositories.settings.getSettingAsString('chat::adminAnnouncementsTitle'),
                image: await this.repositories.settings.getSettingAsString('chat::adminAnnouncementsImage'),
            },
            { transaction },
        );
    }

    async createAdminAnnouncementsChatIfNotExists(): Promise<Chat> {
        const chat: Chat | null = await this.db.Chat.findOne({ where: { type: ChatType.AdminAnnouncements } });

        if (!chat) {
            return this.createAdminAnnouncementsChat();
        }

        const title = await this.repositories.settings.getSettingAsString('chat::adminAnnouncementsTitle');
        const image = await this.repositories.settings.getSettingAsString('chat::adminAnnouncementsImage');

        return chat.update({ title, image });
    }

    async createPmChat(userId: string, otherUserId: string): Promise<Chat> {
        if (userId === otherUserId) {
            throw new UserError('CHAT_WITH_SELF_ERROR');
        }

        const user = await this.repositories.users.getUserByIdStrict(userId);
        const otherUser = await this.repositories.users.getUserByIdStrict(otherUserId);

        const chats: Chat[] = await user.getChats({
            where: { type: ChatType.Pm },
            include: [
                {
                    association: this.db.Chat.Member,
                    where: { id: otherUser.id },
                },
            ],
        });
        if (chats.length > 0) {
            throw new UserError('PM_CHAT_ALREADY_EXISTS');
        }

        const createdChat: Chat = await this.db.Chat.create({
            type: ChatType.Pm,
        });

        await createdChat.addMember(user, { through: { title: otherUser.username, image: otherUser.avatar } });
        await createdChat.addMember(otherUser, { through: { title: user.username, image: user.avatar } });

        return createdChat;
    }

    // TODO: Think about dataloader in here
    async getCustomChatFields(chatId: string, userId: string): Promise<Pick<ChatUser, 'title' | 'image'>> {
        const chatUser = await this.getChatUser(chatId, userId);

        return {
            title: chatUser ? chatUser.title : null,
            image: chatUser ? chatUser.image : null,
        };
    }

    // TODO: Think about dataloader in here
    async getUnreadMessagesCount(chatId: string, userId: string): Promise<number> {
        const chatUser = await this.getChatUser(chatId, userId);
        if (!chatUser) return 0;

        const messageNumber = await this.repositories.messages.getPrevMessageNumber(chatId);

        return messageNumber - chatUser.readMessageNumber;
    }

    async getAllUnreadMessagesCount(userId: string): Promise<number> {
        const user = await this.repositories.users.getUserByIdStrict(userId);
        const chats: Chat[] = await user.getChats({
            where: {
                type: { [Op.ne]: ChatType.Game },
            },
        });

        const unreadCounts = await Promise.all(chats.map(chat => this.getUnreadMessagesCount(chat.id, userId)));
        return unreadCounts.reduce((acc, unreadCount) => acc + unreadCount, 0);
    }

    async readChat(chatId: string, userId: string): Promise<number> {
        const chatUser = await this.getChatUser(chatId, userId);
        if (!chatUser) return 0;

        const messageNumber = await this.repositories.messages.getPrevMessageNumber(chatId);
        const unreadCount = messageNumber - chatUser.readMessageNumber;

        await chatUser.update({ readMessageNumber: messageNumber });

        return unreadCount;
    }
}

export default ChatsRepository;
