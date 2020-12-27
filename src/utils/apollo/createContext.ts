import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ExecutionParams } from 'subscriptions-transport-ws';
import { createContext as createDataloaderSequelizeContext, EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';

import { ApolloUserContext, ApolloContext } from '../../interfaces/apollo';
import { SequelizeContext } from '../../interfaces/sequelize';
import { database, repositories } from '../../data/database';
import initRepositories from '../../data/repositories';
import config from '../../config';

export interface ConnectionParams {
    authToken: string;
}

export interface Payload {
    id: string;
}

export const isValidConnectionParams = (connectionParams: object): connectionParams is ConnectionParams => {
    return (
        'authToken' in connectionParams && typeof (connectionParams as { authToken: unknown }).authToken === 'string'
    );
};

export const isValidPayload = (payload: object | string): payload is Payload => {
    return typeof payload === 'object' && 'id' in payload && typeof (payload as { id: unknown }).id === 'string';
};

// Request can be undefined because apollo doesn't provide this for websocket connection
export const createContext = async (
    req?: Request,
    res?: Response,
    connection?: ExecutionParams,
): Promise<ApolloContext> => {
    const sequelizeContext: SequelizeContext = {
        [EXPECTED_OPTIONS_KEY]: createDataloaderSequelizeContext(database.sequelize),
    };
    const commonContext = {
        repositories: initRepositories(database, sequelizeContext),
    };

    if (connection) {
        return {
            ...commonContext,
            ...connection.context,
        };
    }

    if (!req) return commonContext;

    return {
        ...commonContext,
        req,
        res,
        user: (req.user && (await repositories.users.getUserById(req.user.id))) || undefined,
    };
};

export const createWebSocketContext = async (connectionParams: object): Promise<ApolloUserContext> => {
    if (!isValidConnectionParams(connectionParams)) {
        return {};
    }

    const payload = jwt.verify(connectionParams.authToken, config.auth.jwt.secret);
    if (!isValidPayload(payload)) {
        return {};
    }

    return {
        user: (await repositories.users.getUserById(payload.id)) || undefined,
    };
};
