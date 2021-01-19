import { Op } from 'sequelize';

import BaseRepository from './base';
import { UserError } from '../../utils/errors';
import Locker from '../../utils/locker';
import { Message } from '../models/Message';

class MessagesRepository extends BaseRepository {
    static MESSAGES_LIMIT = 50;
    static ADD_MESSAGE_LOCK = new Locker();

    async getMessageById(messageId: string): Promise<Message | null> {
        return this.db.Message.findByPk(messageId, {
            ...this.sequelizeContext,
            rejectOnEmpty: false,
        });
    }

    async getMessageByIdStrict(messageId: string): Promise<Message> {
        const message = await this.getMessageById(messageId);

        if (!message) {
            throw new UserError('NO_MESSAGE');
        }

        return message;
    }

    async getMessagesByChatId(chatId: string, limit?: number, offset?: number): Promise<Message[]> {
        return this.db.Message.findAll({
            where: { chatId },
            order: [
                ['createdAt', 'DESC'],
                ['id', 'DESC'],
            ],
            limit: limit ?? MessagesRepository.MESSAGES_LIMIT,
            offset,
        });
    }

    async countMessages(chatId: string): Promise<number> {
        return this.db.Message.count({ where: { chatId } });
    }

    async getPrevMessageNumber(chatId: string): Promise<number> {
        const prevMessage: Message | null = await this.db.Message.findOne({
            where: { chatId },
            order: [['number', 'DESC']],
        });

        return prevMessage ? prevMessage.number : 0;
    }

    async addMessage(chatId: string, senderId: string, message: string): Promise<Message> {
        await MessagesRepository.ADD_MESSAGE_LOCK.lock();

        try {
            const prevNumber = await this.getPrevMessageNumber(chatId);
            const createdMessage: Message = await this.db.Message.create({
                chatId,
                senderId,
                number: prevNumber + 1,
                message,
            });

            const chat = await this.repositories.chats.getChatByIdStrict(chatId);
            chat.changed('updatedAt', true);
            await chat.update({ updatedAt: createdMessage.createdAt });

            return createdMessage;
        } finally {
            MessagesRepository.ADD_MESSAGE_LOCK.unlock();
        }
    }

    async deleteMessage(messageId: string): Promise<string> {
        const message = await this.getMessageByIdStrict(messageId);

        message.destroy();

        return message.chatId;
    }

    async deleteMessagesBySender(senderId: string): Promise<string[]> {
        const chats = await this.repositories.chats.getAllGameChats();
        const chatIds = chats.map(chat => chat.id);
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

        await this.db.Message.destroy({
            where: {
                chatId: chatIds,
                senderId,
                createdAt: { [Op.gte]: twoDaysAgo },
            },
        });

        return chatIds;
    }
}

export default MessagesRepository;
