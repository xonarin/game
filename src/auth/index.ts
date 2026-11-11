import { Express } from 'express';

import config from '../config';
import { repositories } from '../data/database';
import { initTelegramLink, isTelegramEnabled } from './telegram';
import { isTelegramBonusEnabled } from '../utils/telegram';
import { issueSessionCookie } from './session';

export interface AuthProviders {
    vk: boolean;
    google: boolean;
    steam: boolean;
    // Bot username for the bonus-page Telegram widget (account linking), or null.
    telegramBot: string | null;
    // Public bonus channel username (without "@"), or null for a private/id-only channel.
    telegramChannel: string | null;
    dev: boolean;
    // Central auth service URL; the /login buttons go to `${authServiceUrl}/go?from=<origin>&type=...`.
    authServiceUrl: string | null;
    // This site's origin (for the broker `from` parameter), filled per request on the server.
    origin: string | null;
}

export const isDevLoginEnabled = () => __DEV__ && config.auth.devLogin;

/** The bonus channel as a public @username (without "@"), or null if it is an id-only channel. */
const getPublicBonusChannel = (): string | null => {
    const channel = config.auth.telegram.bonusChannel;
    return isTelegramBonusEnabled() && channel.startsWith('@') ? channel.slice(1) : null;
};

/**
 * Which sign-in methods /login offers. Social login is handled entirely by the central auth
 * service (plant-auth): the buttons link to the broker, which runs the providers. When a broker
 * is configured the social buttons are shown and the broker rejects anything it does not offer.
 */
export const getAuthProviders = (origin?: string): AuthProviders => {
    const brokerOn = Boolean(config.auth.authService.url);
    return {
        vk: brokerOn,
        google: brokerOn,
        steam: brokerOn,
        telegramBot: isTelegramEnabled() ? config.auth.telegram.botUsername : null,
        telegramChannel: getPublicBonusChannel(),
        dev: isDevLoginEnabled(),
        authServiceUrl: config.auth.authService.url || null,
        origin: origin || null,
    };
};

/**
 * Central auth service (plant-auth) callback. The broker redirects here with a one-time ?code=,
 * which we exchange server-to-server for the user and turn into our own site session. Social
 * providers live only in plant-auth; the site never implements OAuth itself.
 */
const initBroker = (app: Express) => {
    const svc = config.auth.authService;

    app.get('/auth/callback', async (req, res, next) => {
        try {
            const code = typeof req.query.code === 'string' ? req.query.code : '';
            if (!code) {
                res.redirect('/login?error=auth');
                return;
            }

            const resp = await fetch(`${svc.internalUrl}/verify`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ code, secret: svc.verifySecret }),
            });
            const data = (await resp.json()) as { userId?: string; isNew?: boolean; error?: string };
            if (!resp.ok || !data.userId) {
                console.warn('[auth/callback] verify failed:', data.error || resp.status);
                res.redirect('/login?error=auth');
                return;
            }

            issueSessionCookie(req, res, data.userId);

            // Apply the referral link for brand-new registrations.
            if (data.isNew) {
                const { refId } = req.cookies;
                if (refId) {
                    await repositories.users.setReferrer(data.userId, refId).catch(() => undefined);
                    res.clearCookie('refId');
                }
            }

            res.redirect('/');
        } catch (e) {
            next(e);
        }
    });
};

export const initAuth = (app: Express) => {
    // Telegram account linking for the bonus (not login).
    initTelegramLink(app);
    // Central auth service callback.
    initBroker(app);
};
