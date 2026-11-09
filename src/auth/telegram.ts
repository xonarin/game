/**
 * Telegram Login Widget (https://core.telegram.org/widgets/login).
 * The widget (rendered on /login) redirects to /auth/telegram/return with
 * id, first_name, last_name, username, photo_url, auth_date, hash.
 * Verification: hash = hex(HMAC_SHA256(data_check_string, SHA256(bot_token))),
 * where data_check_string = all other fields as "key=value", sorted, joined by "\n".
 */
import crypto from 'crypto';
import { Express, Request } from 'express';

import config from '../config';
import { SocialType } from '../data/models/User';
import { getDefaultAvatar, signIn } from './session';

const MAX_AUTH_AGE_SECONDS = 60 * 60 * 24; // reject logins older than 1 day

export const isTelegramEnabled = () => Boolean(config.auth.telegram.botToken && config.auth.telegram.botUsername);

export type TelegramAuthData = Record<string, string>;

export const verifyTelegramAuth = (
    data: TelegramAuthData,
    botToken: string,
    nowSeconds = Math.floor(Date.now() / 1000),
): boolean => {
    const { hash, ...fields } = data;
    if (!hash || !fields.id || !fields.auth_date) return false;

    const dataCheckString = Object.keys(fields)
        .sort()
        .map(key => `${key}=${fields[key]}`)
        .join('\n');
    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const expected = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const a = Buffer.from(expected);
    const b = Buffer.from(hash.toLowerCase());
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

    const authDate = Number(fields.auth_date);
    return Number.isFinite(authDate) && nowSeconds - authDate <= MAX_AUTH_AGE_SECONDS;
};

const readAuthData = (req: Request): TelegramAuthData => {
    const data: TelegramAuthData = {};
    Object.entries(req.query).forEach(([key, value]) => {
        if (typeof value === 'string') data[key] = value;
    });
    return data;
};

export const initTelegram = (app: Express) => {
    app.get('/auth/telegram/return', async (req, res, next) => {
        try {
            if (!isTelegramEnabled()) {
                res.redirect('/login?error=telegram_disabled');
                return;
            }

            const data = readAuthData(req);
            if (!verifyTelegramAuth(data, config.auth.telegram.botToken)) {
                console.error('[telegram] invalid or expired auth data for id', data.id);
                res.redirect('/login?error=telegram');
                return;
            }

            const name = [data.first_name, data.last_name].filter(Boolean).join(' ');
            await signIn(req, res, {
                socialType: SocialType.Telegram,
                socialId: data.id,
                username: name || data.username || `tg${data.id}`,
                avatar:
                    data.photo_url && data.photo_url.startsWith('https://') ? data.photo_url : getDefaultAvatar(req),
            });

            res.redirect('/');
        } catch (e) {
            next(e);
        }
    });
};
