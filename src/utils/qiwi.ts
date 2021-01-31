import fetch from 'node-fetch';
import * as queryString from 'querystring';
import SocksProxyAgent from 'socks-proxy-agent/dist/agent';
import * as http from 'http';

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

export interface QiwiLimit {
    type: string;
    currency: string;
    rest: number;
    max: number;
    spent: number;
    interval: {
        dateFrom: string;
        dateTill: string;
    };
}

export interface QiwiBalance {
    alias: string;
    hasBalance: boolean;
    balance: null | {
        amount: number;
    };
    currency: number;
}

const qiwiPersonId = config.auth.qiwi.personId;
const qiwiPersonToken = config.auth.qiwi.personToken;
const qiwiProxyOptions = config.auth.qiwi.proxy.hostname ? config.auth.qiwi.proxy : undefined;

const qiwiApiLocker = new Locker();
const qiwiAgent = qiwiProxyOptions ? new SocksProxyAgent(qiwiProxyOptions) : undefined;

const qiwiApi = async <T>({
    host,
    authorization = false,
    resource,
    method = 'GET',
    queryParams = {},
    typeGuard = (_0): _0 is T => true,
}: QiwiApiParams<T>): Promise<T> => {
    await qiwiApiLocker.lock();

    try {
        const query = queryString.encode(queryParams);
        const authorizationHeaders: HeadersInit = authorization ? { Authorization: `Bearer ${qiwiPersonToken}` } : {};

        const response = await fetch(`https://${host}/${resource}?${query}`, {
            method,
            agent: qiwiAgent as http.Agent | undefined,
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

const isRecord = (value: unknown): value is Record<string | number | symbol, unknown> =>
    typeof value === 'object' && value !== null;

const qiwiFetchMonthlyTurnoverTypeGuard = (value: unknown): value is Record<'limits', Record<'RU', QiwiLimit[]>> => {
    if (!isRecord(value)) {
        return false;
    }

    if (!('limits' in value) || !isRecord(value.limits)) {
        return false;
    }

    if (!('RU' in value.limits) || !Array.isArray(value.limits.RU)) {
        return false;
    }

    return value.limits.RU.every(elem => {
        if (!isRecord(elem)) {
            return false;
        }

        if (['type', 'currency'].some(field => !(field in elem) || typeof elem[field] !== 'string')) {
            return false;
        }

        if (['rest', 'max', 'spent'].some(field => !(field in elem) || typeof elem[field] !== 'number')) {
            return false;
        }

        if (!('interval' in elem) || !isRecord(elem.interval)) {
            return false;
        }

        return ['dateFrom', 'dateTill'].every(
            field =>
                field in (elem.interval as Record<string, unknown>) ||
                typeof (elem.interval as Record<string, unknown>)[field] === 'string',
        );
    });
};

export const qiwiFetchMonthlyTurnover = async (): Promise<QiwiLimit | undefined> => {
    try {
        const response = await qiwiApi({
            host: 'edge.qiwi.com',
            authorization: true,
            resource: `qw-limits/v1/persons/${qiwiPersonId}/actual-limits`,
            queryParams: {
                'types[0]': 'TURNOVER',
            },
            typeGuard: qiwiFetchMonthlyTurnoverTypeGuard,
        });

        const result = response.limits.RU.filter(limit => limit.currency === 'RUB');
        if (result.length !== 1) {
            console.warn(`qiwiFetchMonthlyTurnover wrong limits count (${result.length})`);
            return undefined;
        }

        return result[0];
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

const qiwiFetchBalanceTypeGuard = (value: unknown): value is Record<'accounts', QiwiBalance[]> => {
    if (!isRecord(value)) {
        return false;
    }

    if (!('accounts' in value) || !Array.isArray(value.accounts)) {
        return false;
    }

    return value.accounts.every(elem => {
        if (!isRecord(elem)) {
            return false;
        }

        if (!('alias' in elem) || typeof elem.alias !== 'string') {
            return false;
        }

        if (!('hasBalance' in elem) || typeof elem.hasBalance !== 'boolean') {
            return false;
        }

        if (!('balance' in elem)) {
            return false;
        }

        if (isRecord(elem.balance)) {
            if (!('amount' in elem.balance)) {
                return false;
            }
        } else if (elem.balance !== null) {
            return false;
        }

        return 'currency' in elem && typeof elem.currency === 'number';
    });
};

const qiwiFetchBalanceGetQiwiBalance = (response: Record<'accounts', QiwiBalance[]>): QiwiBalance | undefined => {
    const balances = response.accounts.filter(account => account.hasBalance && account.currency === 643);

    if (balances.length !== 1) {
        console.warn(`qiwiFetchBalanceGetBalance wrong balances count (${balances.length})`);
        return undefined;
    }

    return balances[0];
};

export const qiwiFetchBalance = async (): Promise<number | undefined> => {
    try {
        const response = await qiwiApi({
            host: 'edge.qiwi.com',
            authorization: true,
            resource: `/funding-sources/v2/persons/${qiwiPersonId}/accounts`,
            typeGuard: qiwiFetchBalanceTypeGuard,
        });

        const balance = qiwiFetchBalanceGetQiwiBalance(response);
        if (!balance) {
            return undefined;
        }

        if (balance.balance === null) {
            const retryResponse = await qiwiApi({
                host: 'edge.qiwi.com',
                authorization: true,
                resource: `/funding-sources/v2/persons/${qiwiPersonId}/accounts`,
                queryParams: {
                    timeout: '1000',
                    alias: balance.alias,
                },
                typeGuard: qiwiFetchBalanceTypeGuard,
            });

            return qiwiFetchBalanceGetQiwiBalance(retryResponse)?.balance?.amount;
        }

        return balance.balance.amount;
    } catch {
        return undefined;
    }
};
