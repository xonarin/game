import { ApolloCache, NormalizedCacheObject } from '@apollo/client';

import { AnnouncementFragment } from '../__generated__/graphql';

export const getAnnouncementsByChatId = (cache: ApolloCache<object>, chatId: string) => {
    const cacheData = (cache as ApolloCache<NormalizedCacheObject>).extract();

    const announcementObjects: AnnouncementFragment[] = [];
    Object.keys(cacheData).forEach(cacheKey => {
        const object = cacheData[cacheKey] as AnnouncementFragment | undefined;

        if (object && object.__typename === 'Announcement' && object.chatId === chatId) {
            announcementObjects.push(object);
        }
    });

    return announcementObjects;
};

export const deleteAnnouncementsByChatId = (cache: ApolloCache<object>, chatId: string) => {
    getAnnouncementsByChatId(cache, chatId).forEach(announcement => cache.evict({ id: cache.identify(announcement) }));
};
