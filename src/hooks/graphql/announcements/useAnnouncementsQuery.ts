import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import {
    AnnouncementsDocument,
    AnnouncementsQuery,
    UpdatedAnnouncementDocument,
    UpdatedAnnouncementSubscription,
} from '../../../__generated__/graphql';

interface UseAnnouncementsQueryResult {
    announcements?: AnnouncementsQuery['announcements'];
    loading: boolean;
}

const useAnnouncementsQuery = (): UseAnnouncementsQueryResult => {
    const { data, loading, subscribeToMore } = useQuery<AnnouncementsQuery>(AnnouncementsDocument);

    useEffect(() => {
        return subscribeToMore<UpdatedAnnouncementSubscription>({
            document: UpdatedAnnouncementDocument,
            updateQuery: (prev, { subscriptionData }) => {
                const { updatedAnnouncement } = subscriptionData.data;
                if (!updatedAnnouncement) return prev;

                return {
                    ...prev,
                    announcements: [updatedAnnouncement, ...prev.announcements],
                };
            },
        });
    }, [subscribeToMore]);

    return {
        announcements: data?.announcements,
        loading,
    };
};

export default useAnnouncementsQuery;
