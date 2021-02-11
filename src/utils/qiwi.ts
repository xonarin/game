import fetch, { BodyInit, HeadersInit } from 'node-fetch';
import * as queryString from 'querystring';
import SocksProxyAgent from 'socks-proxy-agent/dist/agent';
import * as http from 'http';
import { DateTime, Duration } from 'luxon';

import config from '../config';
import Locker from './locker';
import { UserError } from './errors';
import { repositories } from '../data/database';

interface QiwiApiParams<T> {
    proxy?: boolean;
    host: 'qiwi.com' | 'api.qiwi.com' | 'edge.qiwi.com';
    authorization?: string;
    resource: string;
    method?: 'GET' | 'POST' | 'PUT';
    queryParams?: Record<string, string>;
    data?: BodyInit;
    headers?: HeadersInit;
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

export enum QiwiWithdrawMethod {
    Visa = 'Visa',
    YooMoney = 'YooMoney',
    Wmz = 'Wmz',
    Qiwi = 'Qiwi',
}

export interface QiwiWithdrawPurse {
    account: string;
    remName?: string;
    remNameF?: string;
    recAddress?: string;
    recCity?: string;
    recCountry?: string;
    regName?: string;
    regNameF?: string;
}

const qiwiPersonId = config.auth.qiwi.personId;
const qiwiPersonToken = config.auth.qiwi.personToken;
const qiwiProxyOptions = config.auth.qiwi.proxy.hostname ? config.auth.qiwi.proxy : undefined;
const qiwiP2pSecret = config.auth.qiwi.p2pSecret;

const qiwiApiLocker = new Locker();
const qiwiAgent = qiwiProxyOptions ? new SocksProxyAgent(qiwiProxyOptions) : undefined;

const qiwiApi = async <T>({
    proxy = true,
    host,
    authorization,
    resource,
    method = 'GET',
    queryParams = {},
    data,
    headers = {},
    typeGuard = (_0): _0 is T => true,
}: QiwiApiParams<T>): Promise<T> => {
    await qiwiApiLocker.lock();

    try {
        const query = queryString.encode(queryParams);
        const authorizationHeaders: HeadersInit = authorization ? { Authorization: `Bearer ${authorization}` } : {};

        const response = await fetch(`https://${host}/${resource}?${query}`, {
            method,
            agent: proxy ? (qiwiAgent as http.Agent | undefined) : undefined,
            body: data,
            headers: {
                Accept: 'application/json',
                ...authorizationHeaders,
                ...headers,
            },
        }).catch(reason => {
            console.warn('qiwiApi fetch catch', { host, authorization, resource, method, queryParams, data }, reason);
            throw new Error('Qiwi API error');
        });

        if (!response.ok) {
            console.warn(
                'qiwiApi !response.ok',
                { host, authorization, resource, method, queryParams, data },
                response.status,
                await response.text(),
            );
            throw new Error('Qiwi API error');
        }

        const responseJson = await response.json().catch(reason => {
            console.warn(
                'qiwiApi response.json() catch',
                { host, authorization, resource, method, queryParams, data },
                reason,
            );

            throw new Error('Qiwi API error');
        });

        if (!typeGuard(responseJson)) {
            console.warn(
                'qiwiApi !typeGuard(responseJson)',
                { host, authorization, resource, method, queryParams, data },
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
            authorization: qiwiPersonToken,
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
            authorization: qiwiPersonToken,
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
            authorization: qiwiPersonToken,
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
                authorization: qiwiPersonToken,
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

const qiwiDoWithdrawFetchId = (method: QiwiWithdrawMethod): string => {
    switch (method) {
        case QiwiWithdrawMethod.Visa:
            return '1960';

        case QiwiWithdrawMethod.YooMoney:
            return '26476';

        case QiwiWithdrawMethod.Wmz:
            return '31271';

        case QiwiWithdrawMethod.Qiwi:
            return '99';

        default:
            throw new Error('wtf');
    }
};

export const qiwiDoWithdraw = async (
    amount: number,
    method: QiwiWithdrawMethod,
    purse: QiwiWithdrawPurse,
    userId: string,
): Promise<string> => {
    const id = qiwiDoWithdrawFetchId(method);

    const payment = {
        id: String(Date.now()),
        sum: {
            amount,
            currency: '643',
        },
        paymentMethod: {
            type: 'Account',
            accountId: '643',
        },
        fields: {
            account: purse.account,
            rem_name: purse.remName,
            rem_name_f: purse.remNameF,
            rec_address: purse.recAddress,
            rec_city: purse.recCity,
            rec_country: purse.recCountry,
            reg_name: purse.regName,
            reg_name_f: purse.regNameF,
        },
    };

    try {
        const response = await qiwiApi({
            host: 'edge.qiwi.com',
            authorization: qiwiPersonToken,
            resource: `sinap/api/v2/terms/${id}/payments`,
            method: 'POST',
            data: JSON.stringify(payment),
            headers: { 'Content-Type': 'application/json' },
            typeGuard: (value): value is Record<'transaction', Record<'id', string>> =>
                isRecord(value) &&
                'transaction' in value &&
                isRecord(value.transaction) &&
                'id' in value.transaction &&
                typeof value.transaction.id === 'string',
        });

        await repositories.payments.addQiwiWithdraw(
            id,
            purse.account,
            payment.id,
            amount,
            response.transaction.id,
            userId,
        );

        return response.transaction.id;
    } catch {
        throw new UserError('QIWI_WITHDRAW_FAILED');
    }
};

const qiwiCreateBillDuration = Duration.fromObject({ days: 45 });

export const qiwiCreateBill = async (billId: string, amount: number): Promise<string> => {
    const bill = {
        amount: {
            value: amount,
            currency: 'RUB',
        },
        expirationDateTime: DateTime.local()
            .plus(qiwiCreateBillDuration)
            .set({ millisecond: 0 })
            .toISO({ suppressMilliseconds: true }),
    };

    try {
        const response = await qiwiApi({
            host: 'api.qiwi.com',
            authorization: qiwiP2pSecret,
            resource: `partner/bill/v1/bills/${billId}`,
            method: 'PUT',
            data: JSON.stringify(bill),
            headers: { 'Content-Type': 'application/json' },
            typeGuard: (value): value is Record<'payUrl', string> =>
                isRecord(value) && 'payUrl' in value && typeof value.payUrl === 'string',
        });

        return response.payUrl;
    } catch {
        throw new UserError('QIWI_DEPOSIT_FAILED');
    }
};
