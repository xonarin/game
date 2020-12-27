import { merge } from 'lodash';
import { ApolloClient, from } from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';

import createCache from './createCache';
import { errorLink, schemaLink } from './links';
import schema from '../../data/modules/clientState/schema';
import { defaults, resolvers } from '../../data/modules/clientState/resolvers';

// TODO: write typings for partialCacheDefaults
const createApolloClient = (schemaOptions: SchemaLink.Options, partialCacheDefaults: object = {}) => {
    const cache = createCache();
    cache.restore({ ROOT_QUERY: merge(defaults, partialCacheDefaults) });

    const link = from([errorLink(), schemaLink(schemaOptions)]);

    return new ApolloClient({
        link,
        cache,
        typeDefs: schema,
        resolvers,
        ssrMode: true,
        queryDeduplication: true,
    });
};

export default createApolloClient;
