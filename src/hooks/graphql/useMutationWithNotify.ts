import { DocumentNode } from 'graphql';
import { MutationHookOptions, OperationVariables, useApolloClient, useMutation } from '@apollo/client';

import { AddNotificationDocument, AddNotificationMutationVariables, Notification } from '../../__generated__/graphql';
import { makeNotificationFromError } from '../../utils/apollo/notifications';

const useMutationWithNotify = <TData = unknown, TVariables = OperationVariables>(
    mutation: DocumentNode,
    options?: MutationHookOptions<TData, TVariables>,
) => {
    const client = useApolloClient();

    return useMutation<TData, TVariables>(mutation, {
        onError: async error => {
            await Promise.all(
                error.graphQLErrors.map(err => {
                    return client.mutate<Notification, AddNotificationMutationVariables>({
                        mutation: AddNotificationDocument,
                        variables: { input: makeNotificationFromError(err.message) },
                    });
                }),
            );
        },
        ...options,
    });
};

export default useMutationWithNotify;
