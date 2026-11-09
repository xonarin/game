/**
 * Telegram Bot API helpers for the bonus eligibility checks:
 *   - subscription to the bonus channel (getChatMember; the bot must be an admin of the channel);
 *   - having started the bot (recorded from the webhook, see src/routes/telegram.ts).
 */
import Redis, { RedisOptions } from 'ioredis';

import config from '../config';

const redisOptions: RedisOptions = {
    retryStrategy: times => Math.min(times * 50, 2000),
};

const redis = new Redis(config.redisUrl, redisOptions);

// Redis set of Telegram user ids that have sent /start to the bot.
const STARTED_BOT_KEY = 'telegram:started_bot';

const apiUrl = (method: string) => `https://api.telegram.org/bot${config.auth.telegram.botToken}/${method}`;

/** Channel subscription can be checked only when the bot and channel are configured. */
export const isTelegramBonusEnabled = () => Boolean(config.auth.telegram.botToken && config.auth.telegram.bonusChannel);

interface TelegramResponse<T> {
    ok: boolean;
    result?: T;
    description?: string;
}

const callApi = async <T>(method: string, params: Record<string, string>): Promise<T | null> => {
    try {
        const res = await fetch(`${apiUrl(method)}?${new URLSearchParams(params)}`);
        const json = (await res.json()) as TelegramResponse<T>;
        if (!json.ok) {
            console.warn('[telegram] api error', method, json.description);
            return null;
        }
        return json.result ?? null;
    } catch (e) {
        console.warn('[telegram] api request failed', method, e);
        return null;
    }
};

// Statuses that count as "subscribed" (restricted is still a member while is_member is true).
const MEMBER_STATUSES = new Set(['creator', 'administrator', 'member', 'restricted']);

interface ChatMember {
    status: string;
    is_member?: boolean;
}

/** True if the Telegram user is a member of the configured bonus channel. */
export const telegramIsChannelSubscribed = async (telegramUserId: string): Promise<boolean> => {
    const member = await callApi<ChatMember>('getChatMember', {
        chat_id: config.auth.telegram.bonusChannel,
        user_id: telegramUserId,
    });
    if (!member) return false;
    if (member.status === 'restricted') return member.is_member === true;
    return MEMBER_STATUSES.has(member.status);
};

/** Marks a Telegram user as having started the bot (called from the webhook on /start). */
export const telegramMarkBotStarted = async (telegramUserId: string): Promise<void> => {
    await redis.sadd(STARTED_BOT_KEY, telegramUserId);
};

/** True if the Telegram user has started the bot. */
export const telegramHasStartedBot = async (telegramUserId: string): Promise<boolean> =>
    (await redis.sismember(STARTED_BOT_KEY, telegramUserId)) === 1;
