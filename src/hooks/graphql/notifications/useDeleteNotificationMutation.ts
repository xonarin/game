import { FetchResult, useMutation } from '@apollo/client';

import {
    DeleteNotificationDocument,
    DeleteNotificationInput,
    DeleteNotificationMutation,
    DeleteNotificationMutationVariables,
} from '../../../__generated__/graphql';

export interface UseDeleteNotificationMutationResult {
    (input: DeleteNotificationInput): Promise<FetchResult<DeleteNotificationMutation>>;
}

const useDeleteNotificationMutation = (): UseDeleteNotificationMutationResult => {
    const [deleteNotification] = useMutation<DeleteNotificationMutation, DeleteNotificationMutationVariables>(
        DeleteNotificationDocument,
    );

    return input => deleteNotification({ variables: { input } });
};

export default useDeleteNotificationMutation;
