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
    // Present for server-to-server callers (plant-auth) that send `X-Service-Token`.
    serviceToken?: string;
    // plant-admin без сессии админа (крон): заголовок X-Admin-Service-Token
    adminServiceToken?: string;
}

export interface ClientStateContext {
    cache: InMemoryCache;
    client: ApolloClient<NormalizedCacheObject>;
}
