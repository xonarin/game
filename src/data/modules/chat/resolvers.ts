import { GraphQLScalarType } from 'graphql';
import { GraphQLDateTime, GraphQLURL } from 'graphql-scalars';
import { chain, IRules } from 'graphql-shield';

import { Resolver, Resolvers, ResolverSubscriber, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import { SerializedModel } from '../../../interfaces/sequelize';
import {
    Chat,
    ChatMessagesArgs,
    DeletedMessagePayload,
    DeletedMessagesBySenderPayload,
    Message,
    Mutation,
    MutationDeleteMessageArgs,
    MutationSendMessageArgs,
    MutationWarnChatArgs,
    Query,
    QueryChatArgs,
    Subscription,
    SubscriptionDeletedMessageArgs,
    SubscriptionDeletedMessagesBySenderArgs,
} from '../../../__generated__/graphql';
import { Chat as ChatBackend, ChatType as ChatTypeEnum } from '../../models/Chat';
import { Message as MessageBackend } from '../../models/Message';
import { OriginUserParent } from '../users/resolvers';
import pubsub from '../../pubsub';
import { isAdminOrModerator, isAuth } from '../rules';
import { checkSendMessageArgs } from './rules';
import { UserError } from '../../../utils/errors';
import { withFilter, withFilterByTarget } from '../../../utils/withFilter';
import { limit } from '../../../utils/graphql-shield/limit';
import { getBanEndTime, warnsMap } from '../../../utils/chatWarns';
import { buildMessageToAnnouncement } from '../../../utils/announcements';

export type OriginChatParent = ChatBackend;
export type OriginMessageParent = MessageBackend;

type QueryType = Pick<Query, 'chat'>;
type MutationType = Pick<Mutation, 'sendMessage' | 'deleteMessage' | 'warnChat'>;
type SubscriptionType = Pick<Subscription, 'sentMessage' | 'deletedMessage' | 'deletedMessagesBySender'>;
type ChatType = Pick<
    Chat,
    'id' | 'type' | 'title' | 'image' | 'updatedAt' | 'members' | 'messages' | 'messagesCount' | 'unreadMessagesCount'
>;
type MessageType = Pick<Message, 'id' | 'chatId' | 'chatType' | 'sender' | 'message' | 'createdAt'>;

interface QueryMapping {
    chat: Resolver<OriginChatParent, QueryChatArgs>;
}

interface MutationMapping {
    sendMessage: Resolver<OriginMessageParent, MutationSendMessageArgs>;
    deleteMessage: Resolver<DeletedMessagePayload, MutationDeleteMessageArgs>;
    warnChat: Resolver<DeletedMessagesBySenderPayload, MutationWarnChatArgs>;
}

interface SubscriptionMapping {
    sentMessage: ResolverSubscriber<OriginMessageParent, SerializedModel<OriginMessageParent>>;
    deletedMessage: ResolverSubscriber<DeletedMessagePayload, DeletedMessagePayload, SubscriptionDeletedMessageArgs>;
    deletedMessagesBySender: ResolverSubscriber<
        DeletedMessagesBySenderPayload,
        DeletedMessagesBySenderPayload,
        SubscriptionDeletedMessagesBySenderArgs
    >;
}

interface ChatMapping {
    members: Resolver<OriginUserParent[]>;
    messages: Resolver<OriginMessageParent[], ChatMessagesArgs>;
}

interface MessageMapping {
    sender: Resolver<OriginUserParent>;
}

type ChatResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        Mutation: TypeResolvers<MutationType, MutationMapping>;
        Subscription: TypeResolvers<SubscriptionType, SubscriptionMapping>;
        Chat: TypeResolvers<ChatType, ChatMapping, OriginChatParent>;
        Message: TypeResolvers<MessageType, MessageMapping, OriginMessageParent>;
        URL: GraphQLScalarType;
        DateTime: GraphQLScalarType;
    },
    ApolloContext
>;

export const rules: IRules = {
    Mutation: {
        sendMessage: chain(limit(15, 'chat'), isAuth, checkSendMessageArgs),
        deleteMessage: isAdminOrModerator,
        warnChat: isAdminOrModerator,
    },
};

export const resolvers: ChatResolvers = {
    Query: {
        chat: async (_0, { chatId }, { user, repositories }) => {
            const chat = await repositories.chats.getChatByIdStrict(chatId);

            if (!(await chat.canRead(user))) {
                throw new UserError('CHAT_NOT_ALLOWED');
            }

            return chat;
        },
    },
    Mutation: {
        sendMessage: async (_0, { input: { chatId, message } }, { user, repositories }) => {
            const chat = await repositories.chats.getChatByIdStrict(chatId);

            // Проверка на бан чата
            // if (user!.chatWarns > 0) Все чаты
            if (chat.type === ChatTypeEnum.Game && user!.chatWarns > 0) {
                const now = Date.now();
                const banEndTime = getBanEndTime(user!.chatWarnsUpdatedAt, user!.chatWarns);

                if (now < banEndTime) {
                    throw new UserError('CHAT_BANNED');
                }
            }

            if (!(await chat.canWrite(user))) {
                throw new UserError('CHAT_NOT_ALLOWED');
            }

            // Проверка депозитов
            const gameChats = await repositories.chats.getAllGameChats();
            if (gameChats.some(gameChat => gameChat.id === chatId)) {
                const payments = await repositories.payments.getFinishedPaymentsSumByUserId(user!.id);
                const minPayments = await repositories.settings.getSettingAsNumber('chat::minDepsToSendGlobalMessage');

                if (payments < minPayments) {
                    throw new UserError('SEND_MESSAGE_NOT_ENOUGH_DEPS');
                }
            }

            const sentMessage = await repositories.messages.addMessage(chatId, user!.id, message);
            await repositories.chats.readChat(chatId, user!.id);

            const target = await chat.getTarget([user!.id]);
            pubsub.publish('sentMessage', sentMessage, target).then();

            if (chat.type === ChatTypeEnum.AdminAnnouncements) {
                pubsub
                    .publish('updatedAnnouncement', buildMessageToAnnouncement(chat)(sentMessage), [user!.id], true)
                    .then();
            }

            return sentMessage;
        },
        deleteMessage: async (_0, { input: { messageId } }, { repositories }) => {
            const chatId = await repositories.messages.deleteMessage(messageId);
            const chat = await repositories.chats.getChatByIdStrict(chatId);
            const payload = { chatId, messageId };

            pubsub.publish('deletedMessage', payload, await chat.getTarget()).then();

            return payload;
        },
        warnChat: async (_0, { input: { userId } }, { user: moderator, repositories }) => {
            const user = await repositories.users.warnChat(userId);
            const chatIds = await repositories.messages.deleteMessagesBySender(userId);
            const payload = { chatIds, senderId: userId };

            const warnCount = user.chatWarns;
            const banTimeMin = warnsMap[warnCount];
            pubsub.publish('deletedMessagesBySender', payload).then();
            chatIds.forEach(chatId => {
                repositories.chats.getChatByIdStrict(chatId).then(chat => {
                    repositories.messages
                        .addMessage(
                            chat.id,
                            moderator!.id,
                            `${user.username} нарушил правила чата ${warnCount} раз(а) и забанен на ${banTimeMin} мин.`,
                        )
                        .then(sendMessage => pubsub.publish('sentMessage', sendMessage))
                        .then();
                });
            });

            return payload;
        },
    },
    Subscription: {
        sentMessage: {
            resolve: (data, _0, { repositories }) =>
                data ? repositories.messages.getMessageByIdStrict(data.sentMessage.id) : null,
            subscribe: withFilterByTarget('sentMessage'),
        },
        deletedMessage: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('deletedMessage'),
                ({ deletedMessage, target }, { chatId }, { user }) =>
                    (!target || Boolean(user && target.includes(user.id))) && deletedMessage.chatId === chatId,
            ),
        },
        deletedMessagesBySender: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('deletedMessagesBySender'),
                ({ deletedMessagesBySender }, { chatId }) => deletedMessagesBySender.chatIds.includes(chatId),
            ),
        },
    },
    Chat: {
        title: async (chat, _0, { user, repositories }) => {
            if (user) {
                const { title } = await repositories.chats.getCustomChatFields(chat.id, user.id);
                if (title !== null) return title;
            }

            return chat.title;
        },
        image: async (chat, _0, { user, repositories }) => {
            if (user) {
                const { image } = await repositories.chats.getCustomChatFields(chat.id, user.id);
                if (image !== null) return image;
            }

            return chat.image;
        },
        members: chat => chat.getMembers(),
        messages: async (chat, { offset }, { repositories }) => {
            const messages = await repositories.messages.getMessagesByChatId(
                chat.id,
                undefined,
                chat.type !== ChatTypeEnum.Game && offset ? offset : undefined,
            );
            return messages.reverse();
        },
        messagesCount: (chat, _0, { repositories }) => repositories.messages.countMessages(chat.id),
        unreadMessagesCount: (chat, _0, { user, repositories }) =>
            user ? repositories.chats.getUnreadMessagesCount(chat.id, user.id) : 0,
    },
    Message: {
        chatType: async (message, _0, { repositories }) => {
            const chat = await repositories.chats.getChatByIdStrict(message.chatId);
            return chat.type;
        },
        sender: (message, _0, { repositories }) => repositories.users.getUserByIdStrict(message.senderId),
    },
    URL: GraphQLURL,
    DateTime: GraphQLDateTime,
};
