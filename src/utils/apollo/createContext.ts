import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createContext as createDataloaderSequelizeContext, EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';

import { ApolloContext } from '../../interfaces/apollo';
import { SequelizeContext } from '../../interfaces/sequelize';
import { database, repositories } from '../../data/database';
import initRepositories from '../../data/repositories';
import { User } from '../../data/models/User';
import config from '../../config';

export interface Payload {
    id: string;
}

export const isValidPayload = (payload: unknown): payload is Payload =>
    typeof payload === 'object' &&
    payload !== null &&
    'id' in payload &&
    typeof (payload as { id: unknown }).id === 'string';

const createCommonContext = (): ApolloContext => {
    const sequelizeContext: SequelizeContext = {
        [EXPECTED_OPTIONS_KEY]: createDataloaderSequelizeContext(database.sequelize),
    };
    return {
        repositories: initRepositories(database, sequelizeContext),
    };
};

/** Context for HTTP GraphQL requests and server-side rendering (user comes from express-jwt). */
export const createContext = async (req?: Request, res?: Response): Promise<ApolloContext> => {
    const commonContext = createCommonContext();

    if (!req) return commonContext;

    const serviceTokenHeader = req.headers['x-service-token'];

    return {
        ...commonContext,
        req,
        res,
        user: (req.user && (await repositories.users.getUserById(req.user.id))) || undefined,
        serviceToken: Array.isArray(serviceTokenHeader) ? serviceTokenHeader[0] : serviceTokenHeader,
    };
};

/** Context for a WebSocket subscription operation, the user is resolved once per connection. */
export const createSubscriptionContext = (user?: User): ApolloContext => ({
    ...createCommonContext(),
    user,
});

const readCookie = (cookieHeader: string | undefined, name: string): string | undefined => {
    if (!cookieHeader) return undefined;
    const pair = cookieHeader
        .split(';')
        .map(part => part.trim())
        .find(part => part.startsWith(`${name}=`));
    return pair ? decodeURIComponent(pair.slice(name.length + 1)) : undefined;
};

/**
 * Resolves the user of a WebSocket connection: the session cookie sent with the upgrade request,
 * or `authToken` from connection params (older clients). Invalid tokens mean "guest".
 */
export const getWebSocketUser = async (
    connectionParams: Record<string, unknown> | undefined,
    cookieHeader: string | undefined,
): Promise<User | undefined> => {
    const fromParams = connectionParams && connectionParams.authToken;
    const token = readCookie(cookieHeader, config.auth.tokenKey) || (typeof fromParams === 'string' ? fromParams : '');
    if (!token) return undefined;

    try {
        const payload = jwt.verify(token, config.auth.jwt.secret, { algorithms: ['HS256'] });
        if (!isValidPayload(payload)) return undefined;
        return (await repositories.users.getUserById(payload.id)) || undefined;
    } catch {
        return undefined;
    }
};
