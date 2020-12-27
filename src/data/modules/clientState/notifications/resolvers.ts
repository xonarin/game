import {
    DeletedNotificationPayload,
    Mutation,
    MutationAddNotificationArgs,
    MutationDeleteNotificationArgs,
    Notification,
    NotificationsDocument,
    NotificationsQuery,
    Query,
} from '../../../../__generated__/graphql';
import { Resolver, Resolvers, TypeResolvers } from '../../../../interfaces/graphql';
import { ClientStateContext } from '../../../../interfaces/apollo';

type QueryType = Pick<Query, 'notifications'>;
type MutationType = Pick<Mutation, 'addNotification' | 'deleteNotification' | 'clearNotifications'>;

interface MutationMapping {
    addNotification: Resolver<Notification, MutationAddNotificationArgs>;
    deleteNotification: Resolver<DeletedNotificationPayload, MutationDeleteNotificationArgs>;
    clearNotifications: Resolver<boolean>;
}

type NotificationsResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, {}, QueryType>;
        Mutation: TypeResolvers<MutationType, MutationMapping>;
    },
    ClientStateContext
>;

export const defaults: QueryType = {
    notifications: [],
};

export const resolvers: NotificationsResolvers = {
    Mutation: {
        addNotification: (_0, { input: newNotification }, { cache, client }) => {
            const data = cache.readQuery<NotificationsQuery>({ query: NotificationsDocument });
            if (data) {
                cache.writeQuery({
                    query: NotificationsDocument,
                    data: { ...data, notifications: [newNotification, ...data.notifications] },
                });

                // Delete notification from cache if autoDismiss is positive
                if (newNotification.autoDismiss > 0) {
                    setTimeout(() => {
                        const anotherData = client.readQuery<NotificationsQuery>({ query: NotificationsDocument });
                        if (anotherData) {
                            client.writeQuery({
                                query: NotificationsDocument,
                                data: {
                                    ...data,
                                    notifications: anotherData.notifications.filter(
                                        notification => notification.id !== newNotification.id,
                                    ),
                                },
                            });
                        }
                    }, newNotification.autoDismiss);
                }
            }
            return {
                __typename: 'Notification',
                ...newNotification,
            };
        },
        deleteNotification: (_0, { input: { notificationId } }, { cache }) => {
            const data = cache.readQuery<NotificationsQuery>({ query: NotificationsDocument });
            if (data) {
                cache.writeQuery({
                    query: NotificationsDocument,
                    data: {
                        ...data,
                        notifications: data.notifications.filter(notification => notification.id !== notificationId),
                    },
                });
            }
            return {
                __typename: 'DeletedNotificationPayload',
                notificationId,
            };
        },
        clearNotifications: (_0, _1, { cache }) => {
            cache.writeQuery({
                query: NotificationsDocument,
                data: { notifications: [] },
            });
            return true;
        },
    },
};
