import { HttpLink, HttpOptions, split } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { SchemaLink } from '@apollo/client/link/schema';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

import { getCookie } from '../cookies';

const loggableErrorCodes = new Set(['INTERNAL_SERVER_ERROR', 'DOWNSTREAM_SERVICE_ERROR']);

export const errorLink = () => {
    return onError(errorResponse => {
        const { graphQLErrors, networkError } = errorResponse;

        if (graphQLErrors) {
            graphQLErrors.forEach(({ message, locations, path, extensions }) => {
                if (!extensions || loggableErrorCodes.has(String(extensions.code))) {
                    console.warn(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
                }
            });
        }

        if (networkError) {
            console.warn(`[Network error]: ${networkError}`);
        }
    });
};

export const schemaLink = (options: SchemaLink.Options) => {
    return new SchemaLink({ ...options });
};

export const httpLink = (options: HttpOptions = {}) => {
    return new HttpLink({
        uri: '/graphql',
        credentials: 'include',
        ...options,
    });
};

export const wsLink = () => {
    const { protocol: originalProtocol, hostname, host: originalHost } = window.location;
    // In development the WebSocket server listens on its own port (config.devPort = 3002)
    const host = __DEV__ ? `${hostname}:3002` : originalHost;
    const protocol = originalProtocol === 'https:' ? 'wss:' : 'ws:';

    return new GraphQLWsLink(
        createClient({
            url: `${protocol}//${host}/graphql`,
            lazy: true,
            retryAttempts: Infinity,
            shouldRetry: () => true,
            // The server also reads the session cookie from the upgrade request
            connectionParams: () => ({ authToken: getCookie('idToken') }),
        }),
    );
};

// eslint-disable-next-line no-shadow
export const requestLink = ({ wsLink, httpLink }: { wsLink: GraphQLWsLink; httpLink: HttpLink }) => {
    return split(
        ({ query }) => {
            const definition = getMainDefinition(query);
            return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
        },
        wsLink,
        httpLink,
    );
};
