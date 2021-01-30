import fetch from 'node-fetch';
import * as queryString from 'querystring';

import config from '../config';
import Locker from './locker';

interface QiwiApiParams<T> {
    host: 'qiwi.com' | 'api.qiwi.com' | 'edge.qiwi.com';
    authorization?: boolean;
    resource: string;
    method?: 'GET' | 'POST';
    queryParams?: Record<string, string>;
    typeGuard?: (value: unknown) => value is T;
}

const qiwiPersonId = config.auth.qiwi.personId;
const qiwiPersonToken = config.auth.qiwi.personToken;

const qiwiApiLocker = new Locker();

const qiwiApi = async <T>({
    host,
    authorization = false,
    resource,
    method = 'GET',
    queryParams = {},
    typeGuard,
}: QiwiApiParams<T>): Promise<T> => {
    await qiwiApiLocker.lock();

    try {
        const query = queryString.encode(queryParams);
        const authorizationHeaders: HeadersInit = authorization ? { Authorization: `Bearer ${qiwiPersonToken}` } : {};

        const response = await fetch(`https://${host}/${resource}?${query}`, {
            method,
            headers: {
                Accept: 'application/json',
                ...authorizationHeaders,
            },
        }).catch(reason => {
            console.warn('qiwiApi fetch catch', { host, authorization, resource, method, queryParams }, reason);
            throw new Error('Qiwi API error');
        });

        if (!response.ok) {
            console.warn('qiwiApi !response.ok', { host, authorization, resource, method, queryParams }, response);
            throw new Error('Qiwi API error');
        }

        const responseJson = await response.json().catch(reason => {
            console.warn(
                'qiwiApi response.json() catch',
                { host, authorization, resource, method, queryParams },
                reason,
            );

            throw new Error('Qiwi API error');
        });

        if (!typeGuard) {
            return responseJson;
        }

        if (!typeGuard(responseJson)) {
            console.warn(
                'qiwiApi !typeGuard(responseJson)',
                { host, authorization, resource, method, queryParams },
                responseJson,
            );

            throw new Error('Qiwi API error');
        }

        return responseJson;
    } finally {
        qiwiApiLocker.unlock();
    }
};

export const qiwiFetchMonthlyTurnover = async (): Promise<string | undefined> => {
    try {
        const response = await qiwiApi({
            host: 'edge.qiwi.com',
            authorization: true,
            resource: `qw-limits/v1/persons/${qiwiPersonId}/actual-limits`,
            queryParams: {
                'types[0]': 'TURNOVER',
            },
        });

        return JSON.stringify(response, null, 4);
    } catch {
        return undefined;
    }
};

export const qiwiFetchRestrictions = async (): Promise<string[] | undefined> => {
    try {
        const response = await qiwiApi({
            host: 'edge.qiwi.com',
            authorization: true,
            resource: `person-profile/v1/persons/${qiwiPersonId}/status/restrictions`,
            typeGuard: (value): value is Record<'restrictionDescription', string>[] =>
                Array.isArray(value) && value.every(elem => typeof elem.restrictionDescription === 'string'),
        });

        return response?.map(({ restrictionDescription }) => restrictionDescription);
    } catch {
        return undefined;
    }
};

export const qiwiFetchBalance = async (): Promise<string | undefined> => {
    try {
        const response = await qiwiApi({
            host: 'edge.qiwi.com',
            authorization: true,
            resource: `/funding-sources/v2/persons/${qiwiPersonId}/accounts`,
        });

        return JSON.stringify(response, null, 4);
    } catch {
        return undefined;
    }
};
