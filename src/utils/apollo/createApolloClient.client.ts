import { ApolloClient, from } from '@apollo/client';
import apolloLogger from 'apollo-link-logger';

import createCache from './createCache';
import { errorLink, httpLink, requestLink, wsLink } from './links';
import schema from '../../data/modules/clientState/schema';
import { resolvers } from '../../data/modules/clientState/resolvers';

const createApolloClient = () => {
    // Restore cache defaults to make the same one in server.js
    const cache = createCache().restore(window.App.cache);

    const link = from([
        ...(__DEV__ ? [apolloLogger] : []),
        errorLink(),
        requestLink({
            httpLink: httpLink(),
            wsLink: wsLink(),
        }),
    ]);

    return new ApolloClient({
        link,
        cache,
        typeDefs: schema,
        resolvers,
        queryDeduplication: true,
        connectToDevTools: true,
    });
};

export default createApolloClient;
