import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';

import typeDefs from './schema';
import { resolvers, permissions } from './resolvers';

/** Admin-only executable schema, guarded by the isAdmin shield. */
const AdminModule = applyMiddleware(makeExecutableSchema({ typeDefs, resolvers }), permissions);

export default AdminModule;
