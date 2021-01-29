import { useCallback } from 'react';
import { FetchResult } from '@apollo/client';

import { ReadChatDocument, ReadChatMutation, ReadChatMutationVariables } from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';
import memoizedThrottle from '../../../utils/memoizedThrottle';
import { deleteAnnouncementsByChatId } from '../../../cache/announcements';

export interface UseReadChatMutationResult {
    (chatId: string): Promise<FetchResult<ReadChatMutation> | undefined>;
}

const READ_NOTIFICATION_INTERVAL = 5000;

const useReadChatMutation = (): UseReadChatMutationResult => {
    const [readChatMutation] = useMutationWithNotify<ReadChatMutation, ReadChatMutationVariables>(ReadChatDocument);

    return useCallback(
        memoizedThrottle(
            chatId =>
                readChatMutation({
                    variables: { chatId },
                    context: { chatId },
                    update: (cache, { data }) => {
                        if (!data) return;

                        deleteAnnouncementsByChatId(cache, chatId);

                        cache.modify({
                            id: `Chat:${chatId}`,
                            fields: {
                                unreadMessagesCount: () => {
                                    return 0;
                                },
                            },
                        });

                        cache.modify({
                            id: 'ROOT_QUERY',
                            fields: {
                                unreadCount: value => value - data.readChat,
                            },
                        });
                    },
                }),
            READ_NOTIFICATION_INTERVAL,
            { trailing: false },
        ),
        [readChatMutation],
    );
};

export default useReadChatMutation;
