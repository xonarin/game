import { useQuery } from '@apollo/client';

import { NotificationsDocument, NotificationsQuery } from '../../../__generated__/graphql';

export interface UseNotificationsQueryResult {
    loading: boolean;
    notifications?: NotificationsQuery['notifications'];
}

const useNotificationsQuery = (): UseNotificationsQueryResult => {
    const { loading, data } = useQuery<NotificationsQuery>(NotificationsDocument);

    return {
        loading,
        notifications: data && data.notifications,
    };
};

export default useNotificationsQuery;
