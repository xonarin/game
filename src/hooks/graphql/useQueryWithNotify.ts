import { DocumentNode } from 'graphql';
import { OperationVariables, QueryHookOptions, useApolloClient, useQuery } from '@apollo/client';

import { AddNotificationDocument, AddNotificationMutationVariables, Notification } from '../../__generated__/graphql';
import { makeNotificationFromError } from '../../utils/apollo/notifications';

const useQueryWithNotify = <TData = unknown, TVariables = OperationVariables>(
    query: DocumentNode,
    options?: QueryHookOptions<TData, TVariables>,
) => {
    const client = useApolloClient();

    return useQuery<TData, TVariables>(query, {
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

export default useQueryWithNotify;
