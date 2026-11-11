/**
 * Telegram account linking for the bonus (NOT social login — that lives in plant-auth).
 * The Telegram Login Widget on the bonus page redirects to /auth/telegram/link with
 * id, first_name, last_name, username, photo_url, auth_date, hash.
 * Verification: hash = hex(HMAC_SHA256(data_check_string, SHA256(bot_token))),
 * where data_check_string = all other fields as "key=value", sorted, joined by "\n".
 */
import crypto from 'crypto';
import { Express, Request } from 'express';

import config from '../config';
import { repositories } from '../data/database';
import { UserError } from '../utils/errors';

const MAX_AUTH_AGE_SECONDS = 5 * 60; // reject data older than 5 minutes
const MAX_CLOCK_SKEW_SECONDS = 60; // tolerance for auth_date slightly in the future

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
    if (!Number.isFinite(authDate)) return false;
    const age = nowSeconds - authDate;
    // Reject data that is too old (replay) or dated in the future beyond a small skew.
    return age <= MAX_AUTH_AGE_SECONDS && age >= -MAX_CLOCK_SKEW_SECONDS;
};

const readAuthData = (req: Request): TelegramAuthData => {
    const data: TelegramAuthData = {};
    Object.entries(req.query).forEach(([key, value]) => {
        if (typeof value === 'string') data[key] = value;
    });
    return data;
};

export const initTelegramLink = (app: Express) => {
    // Connect a Telegram account to the already-logged-in user (for the bonus), regardless of
    // how they signed in. The Telegram login widget on the bonus page posts here.
    app.get('/auth/telegram/link', async (req, res, next) => {
        try {
            if (!req.user) {
                res.redirect('/login');
                return;
            }
            if (!isTelegramEnabled()) {
                res.redirect('/bonuse?telegram=disabled');
                return;
            }

            const data = readAuthData(req);
            if (!verifyTelegramAuth(data, config.auth.telegram.botToken)) {
                console.error('[telegram] invalid or expired link data for id', data.id);
                res.redirect('/bonuse?telegram=error');
                return;
            }

            try {
                await repositories.users.linkTelegram(req.user.id, data.id);
            } catch (e) {
                if (e instanceof UserError && e.message === 'TELEGRAM_ALREADY_LINKED') {
                    res.redirect('/bonuse?telegram=taken');
                    return;
                }
                throw e;
            }

            res.redirect('/bonuse?telegram=linked');
        } catch (e) {
            next(e);
        }
    });
};
