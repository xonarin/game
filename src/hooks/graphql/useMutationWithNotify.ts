import { DocumentNode } from 'graphql';
import {
    MutationFunctionOptions,
    MutationHookOptions,
    MutationResult,
    OperationVariables,
    useApolloClient,
    useMutation,
} from '@apollo/client';
import { FetchResult } from '@apollo/client/link/core';

import { AddNotificationDocument, AddNotificationMutationVariables, Notification } from '../../__generated__/graphql';
import { makeNotificationFromError } from '../../utils/apollo/notifications';

const useMutationWithNotify = <TData = unknown, TVariables = OperationVariables>(
    mutation: DocumentNode,
    options?: MutationHookOptions<TData, TVariables>,
): [
    (options?: MutationFunctionOptions<TData, TVariables>) => Promise<FetchResult<TData> | undefined>,
    MutationResult<TData>,
] => {
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
