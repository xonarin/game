import { Express } from 'express';

import config from '../config';
import { SocialType } from '../data/models/User';
import { repositories } from '../data/database';
import { initVkId, isVkIdEnabled } from './vkid';
import { initTelegram, isTelegramEnabled } from './telegram';
import { initGoogle, isGoogleEnabled } from './google';
import { initSteam, isSteamEnabled } from './steam';
import { isTelegramBonusEnabled } from '../utils/telegram';
import { getDefaultAvatar, signIn, issueSessionCookie } from './session';

export interface AuthProviders {
    vk: boolean;
    google: boolean;
    steam: boolean;
    telegramBot: string | null;
    // Public bonus channel username (without "@"), or null for a private/id-only channel.
    telegramChannel: string | null;
    dev: boolean;
    // Central auth service URL; when set, the /login buttons go through the broker
    // (/auth/go -> auth service -> /auth/callback) instead of the site's own routes.
    authServiceUrl: string | null;
}

export const isDevLoginEnabled = () => __DEV__ && config.auth.devLogin;

/** The bonus channel as a public @username (without "@"), or null if it is an id-only channel. */
const getPublicBonusChannel = (): string | null => {
    const channel = config.auth.telegram.bonusChannel;
    return isTelegramBonusEnabled() && channel.startsWith('@') ? channel.slice(1) : null;
};

/** Which sign-in methods the /login page should offer. */
export const getAuthProviders = (): AuthProviders => ({
    vk: isVkIdEnabled(),
    google: isGoogleEnabled(),
    steam: isSteamEnabled(),
    telegramBot: isTelegramEnabled() ? config.auth.telegram.botUsername : null,
    telegramChannel: getPublicBonusChannel(),
    dev: isDevLoginEnabled(),
    authServiceUrl: config.auth.authService.url || null,
});

const initDevLogin = (app: Express) => {
    if (!isDevLoginEnabled()) return;

    // /auth/dev?user=alice -> local test user "alice" (created on first login)
    app.get('/auth/dev', async (req, res, next) => {
        try {
            const name =
                String(req.query.user || 'dev1')
                    .replace(/[^a-zA-Z0-9_-]/g, '')
                    .slice(0, 32) || 'dev1';

            await signIn(req, res, {
                socialType: SocialType.VK,
                socialId: `dev-${name}`,
                username: name,
                avatar: getDefaultAvatar(req),
            });
            res.redirect('/');
        } catch (e) {
            next(e);
        }
    });

    console.info('[auth] dev login enabled at /auth/dev');
};

/**
 * Central auth service (plant-auth) integration. `/auth/go` sends the browser to the broker
 * (or to a local provider route when no broker is configured); `/auth/callback` exchanges the
 * one-time code the broker returns for the user and sets the site session.
 */
const initBroker = (app: Express) => {
    const svc = config.auth.authService;

    app.get('/auth/go', (req, res) => {
        const type = typeof req.query.type === 'string' ? req.query.type : '';
        const user = typeof req.query.user === 'string' ? req.query.user : '';
        if (!type) {
            res.redirect('/login');
            return;
        }

        // No broker configured: fall back to the site's own provider routes.
        if (!svc.url) {
            if (type === 'dev') {
                res.redirect(`/auth/dev${user ? `?user=${encodeURIComponent(user)}` : ''}`);
                return;
            }
            res.redirect(`/auth/${type === 'tg' ? 'telegram' : type}`);
            return;
        }

        const origin = `${req.protocol}://${req.get('host')}`;
        const params = new URLSearchParams({ from: origin, type });
        if (type === 'dev' && user) {
            params.set('user', user);
        }
        res.redirect(`${svc.url}/go?${params}`);
    });

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
                body: JSON.stringify({ code, secret: svc.sharedSecret }),
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
    initVkId(app);
    initGoogle(app);
    initSteam(app);
    initTelegram(app);
    initDevLogin(app);
    initBroker(app);
};
