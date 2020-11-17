import { Request, Response } from 'express';
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client';

import { User } from '../data/models/User';
import { Repositories } from '../data/repositories';

export interface ApolloUserContext {
    user?: User;
}

export interface ApolloContext extends ApolloUserContext {
    req?: Request;
    res?: Response;
    repositories: Repositories;
}

export interface ClientStateContext {
    cache: InMemoryCache;
    client: ApolloClient<NormalizedCacheObject>;
}
