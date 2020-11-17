import { GraphQLScalarType } from 'graphql';
import { GraphQLURL } from 'graphql-scalars';
import { IRules } from 'graphql-shield';

import { Resolvers, ResolverSubscriber, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import { Query, Subscription } from '../../../__generated__/graphql';
import { withFilterByTarget } from '../../../utils/withFilter';
import { isAuth } from '../rules';
import { buildMessageToAnnouncement } from '../../../utils/announcements';

export type OriginAnnouncementType = {
    id: string;
    chatId: string;
    text: string;
    image?: string | null;
    createdAt: Date;
};

type QueryType = Pick<Query, 'announcements'>;
type SubscriptionType = Pick<Subscription, 'updatedAnnouncement'>;

interface QueryMapping {
    announcements: OriginAnnouncementType[];
}

interface SubscriptionMapping {
    updatedAnnouncement: ResolverSubscriber<OriginAnnouncementType>;
}

type AnnouncementsResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        Subscription: TypeResolvers<SubscriptionType, SubscriptionMapping>;
        URL: GraphQLScalarType;
    },
    ApolloContext
>;

export const rules: IRules = {
    Query: {
        announcements: isAuth,
    },
};

export const resolvers: AnnouncementsResolvers = {
    Query: {
        announcements: async (_0, _1, { user, repositories }) => {
            const chat = await repositories.chats.getAdminAnnouncementsChat();
            const unreadMessagesCount = await repositories.chats.getUnreadMessagesCount(chat.id, user!.id);

            if (unreadMessagesCount === 0) {
                return [];
            }

            const messages = await repositories.messages.getMessagesByChatId(chat.id, unreadMessagesCount);
            return messages.map(buildMessageToAnnouncement(chat));
        },
    },
    Subscription: {
        updatedAnnouncement: {
            subscribe: withFilterByTarget('updatedAnnouncement'),
        },
    },
    URL: GraphQLURL,
};
