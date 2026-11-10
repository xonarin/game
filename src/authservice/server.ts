// Sets the __DEV__ global before any config import — must stay first.
import './globals';

import crypto from 'crypto';
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';

import config, { getConfigErrors } from '../config';
import { repositories } from '../data/database';
import { SocialType } from '../data/models/User';
import { normalizeOrigin } from '../data/repositories/authClients';
import { initAuth, isDevLoginEnabled } from '../auth';
import { isSecureRequest, SocialProfile } from '../auth/session';
import { isTelegramEnabled } from '../auth/telegram';
import { configureLuxon } from '../utils/luxon';
import { createCode, consumeCode } from './codes';

process.on('unhandledRejection', (reason, p) => {
    console.error('[auth] Unhandled Rejection at:', p, 'reason:', reason);
    process.exit(1);
});

const configErrors = getConfigErrors();
if (configErrors.length > 0) {
    console.error(`[auth] invalid configuration:\n  - ${configErrors.join('\n  - ')}`);
    if (!__DEV__) process.exit(1);
}

configureLuxon();

const FROM_COOKIE = 'broker_from';
const FLOW_TTL_MS = 10 * 60 * 1000;

const PROVIDER_START: Record<string, string> = {
    vk: '/auth/vk',
    google: '/auth/google',
    steam: '/auth/steam',
    dev: '/auth/dev',
};

const safeEqual = (a: string, b: string) => {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

const telegramWidgetPage = (): string => `<!doctype html>
<html lang="ru"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Вход через Telegram</title></head>
<body style="background:#17181a;color:#e8e8e8;font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0">
<div style="text-align:center"><p>Войдите через Telegram</p>
<script async src="https://telegram.org/js/telegram-widget.js?22"
 data-telegram-login="${config.auth.telegram.botUsername}" data-size="large" data-radius="8"
 data-auth-url="/auth/telegram/return"></script></div></body></html>`;

const failedPage = (reason: string): string => `<!doctype html>
<html lang="ru"><head><meta charset="utf-8" /><title>Ошибка входа</title></head>
<body style="background:#17181a;color:#e8e8e8;font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0">
<div style="text-align:center"><h2>Не удалось войти</h2><p style="color:#9aa">${reason}</p></div></body></html>`;

/** Broker terminal step: resolve the central user, mint a one-time code, redirect back to the origin site. */
const brokerComplete = async (req: Request, res: Response, profile: SocialProfile): Promise<void> => {
    const from: string | undefined = req.cookies[FROM_COOKIE];
    if (!from || !(await repositories.authClients.isAllowed(from))) {
        res.status(400).type('html').send(failedPage('Источник не разрешён.'));
        return;
    }

    const [user, isNew] = await repositories.users.authSocial(
        profile.socialType,
        profile.socialId,
        profile.username.slice(0, 64) || 'Player',
        profile.avatar,
    );

    // A Telegram login also counts as a linked Telegram account for the bonus.
    if (profile.socialType === SocialType.Telegram && !user.telegramId) {
        await repositories.users.linkTelegram(user.id, profile.socialId);
    }

    const code = await createCode({ userId: user.id, from, isNew });
    res.clearCookie(FROM_COOKIE);
    res.redirect(`${from}/auth/callback?code=${encodeURIComponent(code)}`);
};

const start = async () => {
    const app = express();
    app.set('trust proxy', config.trustProxy);
    app.use(cookieParser());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Entry point for sites: /go?from=<site>&type=<provider>
    app.get('/go', async (req, res) => {
        const from = normalizeOrigin(typeof req.query.from === 'string' ? req.query.from : '');
        const type = typeof req.query.type === 'string' ? req.query.type : '';

        if (!from || !(await repositories.authClients.isAllowed(from))) {
            res.status(400).type('html').send(failedPage('Источник не разрешён.'));
            return;
        }

        res.cookie(FROM_COOKIE, from, {
            maxAge: FLOW_TTL_MS,
            httpOnly: true,
            sameSite: 'lax',
            secure: isSecureRequest(req, config.authService.publicUrl),
        });

        if (type === 'tg') {
            if (!isTelegramEnabled()) {
                res.status(400).type('html').send(failedPage('Telegram не настроен.'));
                return;
            }
            res.type('html').send(telegramWidgetPage());
            return;
        }

        const target = PROVIDER_START[type];
        if (!target || (type === 'dev' && !isDevLoginEnabled())) {
            res.status(400).type('html').send(failedPage('Неизвестный способ входа.'));
            return;
        }
        res.redirect(target);
    });

    // Provider flows on this (broker) domain; on success they call brokerComplete.
    initAuth(app, {
        publicUrl: config.authService.publicUrl,
        loginPath: '/failed',
        complete: brokerComplete,
    });

    // Server-to-server: a site exchanges a one-time code for the user.
    app.post('/verify', async (req, res) => {
        const { code, secret } = req.body || {};
        if (typeof secret !== 'string' || !safeEqual(secret, config.authService.sharedSecret)) {
            res.status(401).json({ error: 'bad secret' });
            return;
        }
        if (typeof code !== 'string' || !code) {
            res.status(400).json({ error: 'no code' });
            return;
        }
        const payload = await consumeCode(code);
        if (!payload) {
            res.status(400).json({ error: 'invalid or expired code' });
            return;
        }
        const user = await repositories.users.getUserById(payload.userId);
        if (!user) {
            res.status(400).json({ error: 'user not found' });
            return;
        }
        res.json({ userId: user.id, username: user.username, isNew: payload.isNew });
    });

    app.get('/failed', (req, res) => {
        const reason = typeof req.query.error === 'string' ? req.query.error : 'Попробуйте ещё раз.';
        res.status(200).type('html').send(failedPage(reason));
    });

    app.get('/version', (_0, res) => {
        res.json({ sha: process.env.GIT_SHA || null, service: 'authservice' });
    });

    app.listen(config.authService.port, () => {
        console.info(`[auth] broker listening on http://localhost:${config.authService.port}`);
    });
};

start().catch(err => {
    console.error('[auth] failed to start:', err);
    process.exit(1);
});
