import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Same origin as the admin server that serves this SPA — the adminToken cookie is sent automatically.
export const client = new ApolloClient({
    link: createHttpLink({ uri: '/graphql', credentials: 'same-origin' }),
    cache: new InMemoryCache(),
});
