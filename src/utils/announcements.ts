import { Chat } from '../data/models/Chat';
import { Message } from '../data/models/Message';
import { OriginAnnouncementType } from '../data/modules/announcements/resolvers';

export const buildMessageToAnnouncement = (chat: Chat) => (message: Message): OriginAnnouncementType => ({
    id: `${chat.id}-${message.id}`,
    chatId: chat.id,
    text: message.message,
    image: chat.image,
    createdAt: message.createdAt,
});

export default { buildMessageToAnnouncement };
