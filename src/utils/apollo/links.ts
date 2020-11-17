import { HttpLink, HttpOptions, split } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { SchemaLink } from '@apollo/client/link/schema';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

import { getCookie } from '../cookies';

const loggableErrorCodes = new Set(['INTERNAL_SERVER_ERROR', 'DOWNSTREAM_SERVICE_ERROR']);

export const errorLink = () => {
    return onError(errorResponse => {
        const { graphQLErrors, networkError } = errorResponse;

        if (graphQLErrors) {
            graphQLErrors.forEach(({ message, locations, path, extensions }) => {
                if (!extensions || loggableErrorCodes.has(extensions.code)) {
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

export const wsLink = (config: Partial<WebSocketLink.Configuration> = {}) => {
    const { protocol: originalProtocol, hostname, host: originalHost } = window.location;
    // Порт 3002 берется из файла config. Дорого делать отдельный клиентский конфиг и связывать его с серверным.
    const host = __DEV__ ? `${hostname}:3002` : originalHost;
    const protocol = originalProtocol === 'https:' ? 'wss:' : 'ws:';

    return new WebSocketLink({
        uri: `${protocol}//${host}/graphql`,
        options: {
            reconnect: true,
            connectionParams: {
                authToken: getCookie('idToken'),
            },
        },
        ...config,
    });
};

// eslint-disable-next-line no-shadow
export const requestLink = ({ wsLink, httpLink }: { wsLink: WebSocketLink; httpLink: HttpLink }) => {
    return split(
        ({ query }) => {
            const definition = getMainDefinition(query);
            return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
        },
        wsLink,
        httpLink,
    );
};
