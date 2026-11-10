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
import { repositories } from '../data/database';
import { UserError } from '../utils/errors';
import { AuthOptions, getDefaultAvatar, signIn } from './session';

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

export const initTelegram = (app: Express, options: AuthOptions = {}) => {
    const loginPath = options.loginPath || '/login';

    app.get('/auth/telegram/return', async (req, res, next) => {
        try {
            if (!isTelegramEnabled()) {
                res.redirect(`${loginPath}?error=telegram_disabled`);
                return;
            }

            const data = readAuthData(req);
            if (!verifyTelegramAuth(data, config.auth.telegram.botToken)) {
                console.error('[telegram] invalid or expired auth data for id', data.id);
                res.redirect(`${loginPath}?error=telegram`);
                return;
            }

            const name = [data.first_name, data.last_name].filter(Boolean).join(' ');
            try {
                await signIn(
                    req,
                    res,
                    {
                        socialType: SocialType.Telegram,
                        socialId: data.id,
                        username: name || data.username || `tg${data.id}`,
                        avatar:
                            data.photo_url && data.photo_url.startsWith('https://')
                                ? data.photo_url
                                : getDefaultAvatar(req, options.publicUrl),
                    },
                    { session: options.session, requireRole: options.requireRole },
                );
            } catch (e) {
                if (e instanceof UserError && e.message === 'NOT_ADMIN') {
                    res.redirect(`${loginPath}?error=not_admin`);
                    return;
                }
                throw e;
            }

            res.redirect(options.successRedirect || '/');
        } catch (e) {
            next(e);
        }
    });

    // Connecting a Telegram account to a logged-in user is a player-site feature (the bonus),
    // not needed in the admin panel.
    if (options.requireRole) {
        return;
    }

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
