import { Express } from 'express';

import config from '../config';
import { SocialType } from '../data/models/User';
import { initVkId, isVkIdEnabled } from './vkid';
import { initTelegram, isTelegramEnabled } from './telegram';
import { getDefaultAvatar, signIn } from './session';

export interface AuthProviders {
    vk: boolean;
    telegramBot: string | null;
    dev: boolean;
}

export const isDevLoginEnabled = () => __DEV__ && config.auth.devLogin;

/** Which sign-in methods the /login page should offer. */
export const getAuthProviders = (): AuthProviders => ({
    vk: isVkIdEnabled(),
    telegramBot: isTelegramEnabled() ? config.auth.telegram.botUsername : null,
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
    initTelegram(app);
    initDevLogin(app);
};
