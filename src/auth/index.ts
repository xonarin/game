import { Express } from 'express';

import config from '../config';
import { SocialType } from '../data/models/User';
import { initVkId, isVkIdEnabled } from './vkid';
import { initTelegram, isTelegramEnabled } from './telegram';
import { initGoogle, isGoogleEnabled } from './google';
import { isTelegramBonusEnabled } from '../utils/telegram';
import { getDefaultAvatar, signIn } from './session';

export interface AuthProviders {
    vk: boolean;
    google: boolean;
    telegramBot: string | null;
    // Public bonus channel username (without "@"), or null for a private/id-only channel.
    telegramChannel: string | null;
    dev: boolean;
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
    telegramBot: isTelegramEnabled() ? config.auth.telegram.botUsername : null,
    telegramChannel: getPublicBonusChannel(),
    dev: isDevLoginEnabled(),
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

export const initAuth = (app: Express) => {
    initVkId(app);
    initGoogle(app);
    initTelegram(app);
    initDevLogin(app);
};
