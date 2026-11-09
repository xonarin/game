import { ApolloClient, ApolloLink, from } from '@apollo/client';
import apolloLogger from 'apollo-link-logger';

import createCache from './createCache';
import { errorLink, httpLink, requestLink, wsLink } from './links';
import { resolvers } from '../../data/modules/clientState/resolvers';

const passThrough = new ApolloLink((operation, forward) => forward(operation));

// Dev-only Apollo logger, but skip the noisy online-counter polling/subscription
// (OnlineQuery / OnlineSubscription) so it doesn't flood the console.
const devLogger = ApolloLink.split(
    operation => /^Online/.test(operation.operationName || ''),
    passThrough,
    apolloLogger,
);

const createApolloClient = () => {
    // Restore cache defaults to make the same one in server.js
    const cache = createCache().restore(window.App.cache);

    const link = from([
        ...(__DEV__ ? [devLogger] : []),
        errorLink(),
        requestLink({
            httpLink: httpLink(),
            wsLink: wsLink(),
        }),
    ]);

    return new ApolloClient({
        link,
        cache,
        resolvers,
        queryDeduplication: true,
        connectToDevTools: true,
    });
};

export default createApolloClient;
