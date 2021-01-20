import * as queryString from 'querystring';
import fetch from 'node-fetch';

import config from '../config';
import Locker from './locker';

const vkApiUrl = 'https://api.vk.com/method';
const vkAccessToken = config.auth.vk.appAccessToken;

const vkGroupId = config.auth.vk.groupId;
const vkGroupAccessToken = config.auth.vk.groupAccessToken;

const vkApiLocker = new Locker();
const vkApiDelay = 50;

const vkApi = async (method: string, params: Record<string, string>) => {
    await vkApiLocker.lock();

    try {
        const query = queryString.encode({
            access_token: vkAccessToken,
            v: '5.126',
            ...params,
        });

        const response = await fetch(`${vkApiUrl}/${method}?${query}`, {
            headers: {
                Accept: 'application/json',
            },
        }).catch(reason => {
            console.warn('vkApi fetch catch', method, query, reason);
            throw new Error('VK API error');
        });

        if (!response.ok) {
            console.warn('vkApi !response.ok', method, query, response);
            throw new Error('VK API error');
        }

        const responseJson = await response.json().catch(reason => {
            console.warn('vkApi response.json() catch', method, query, reason);
            throw new Error('VK API error');
        });

        if (!responseJson.response) {
            console.warn('vkApi !responseJson.response', method, query, responseJson);
            throw new Error('VK API error');
        }

        return responseJson.response;
    } finally {
        setTimeout(() => vkApiLocker.unlock(), vkApiDelay);
    }
};

export const vkIsMemberOfGroup = async (userId: string): Promise<boolean> => {
    try {
        const isMember = await vkApi('groups.isMember', {
            access_token: vkGroupAccessToken,
            group_id: vkGroupId,
            user_id: userId,
        });

        return isMember === 1;
    } catch {
        return false;
    }
};

export const vkIsPageClosed = async (userId: string): Promise<boolean> => {
    try {
        const users = await vkApi('users.get', { user_ids: userId });

        return users[0]?.is_closed;
    } catch {
        return true;
    }
};

export const vkGetFriendsCount = async (userId: string): Promise<number | undefined> => {
    try {
        const result = await vkApi('friends.get', { user_id: userId, count: '1' });

        return result.count;
    } catch {
        return undefined;
    }
};
