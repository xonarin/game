/**
 * VK ID sign-in (OAuth 2.1 Authorization Code + PKCE), without the JS SDK.
 * Endpoints and parameters follow @vkid/sdk 2.6 (src/auth/auth.ts):
 *   GET  https://id.vk.ru/authorize           -> redirect back with code, state, device_id
 *   POST https://id.vk.ru/oauth2/auth         -> access_token, user_id
 *   POST https://id.vk.ru/oauth2/user_info    -> { user: { user_id, first_name, last_name, avatar } }
 * The VK ID user_id is the same VK user id the old OAuth app used, so existing
 * accounts (socialType=VK) keep working.
 */
import crypto from 'crypto';
import { Express, Request, Response } from 'express';
import fetch from 'node-fetch';

import config from '../config';
import { SocialType } from '../data/models/User';
import { getBaseUrl, getDefaultAvatar, isSecureRequest, signIn } from './session';

const VKID_URL = 'https://id.vk.ru';
const SCOPE = 'vkid.personal_info';
const STATE_COOKIE = 'vkid_state';
const VERIFIER_COOKIE = 'vkid_verifier';
const FLOW_TTL_MS = 10 * 60 * 1000;

const base64url = (buf: Buffer) =>
    buf
        .toString('base64')
        .replace(/=+$/, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

const randomString = (bytes = 48) => base64url(crypto.randomBytes(bytes)); // 64 chars, [A-Za-z0-9_-]

const codeChallenge = (verifier: string) =>
    base64url(
        crypto
            .createHash('sha256')
            .update(verifier)
            .digest(),
    );

const getRedirectUri = (req: Request) => `${getBaseUrl(req)}/auth/vk/return`;

const safeEqual = (a: string, b: string) => {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

interface VkIdTokenResponse {
    access_token?: string;
    user_id?: number;
    state?: string;
    error?: string;
    error_description?: string;
}

interface VkIdUserInfoResponse {
    user?: {
        user_id?: string;
        first_name?: string;
        last_name?: string;
        avatar?: string;
    };
    error?: string;
    error_description?: string;
}

const postVkId = async <T>(path: string, query: Record<string, string>, body: Record<string, string>): Promise<T> => {
    const resp = await fetch(`${VKID_URL}${path}?${new URLSearchParams(query)}`, {
        method: 'POST',
        body: new URLSearchParams(body),
    });
    return (await resp.json()) as T;
};

/**
 * VK returns the result either as plain query params or as a JSON `payload` param.
 */
const readCallbackParams = (req: Request): Record<string, string> => {
    const { payload } = req.query;
    if (typeof payload === 'string') {
        try {
            return JSON.parse(payload);
        } catch {
            return {};
        }
    }
    const params: Record<string, string> = {};
    Object.entries(req.query).forEach(([key, value]) => {
        if (typeof value === 'string') params[key] = value;
    });
    return params;
};

const fail = (res: Response, reason: string, details?: unknown) => {
    console.error('[vkid]', reason, details === undefined ? '' : details);
    res.clearCookie(STATE_COOKIE);
    res.clearCookie(VERIFIER_COOKIE);
    res.redirect('/login?error=vk');
};

export const isVkIdEnabled = () => Boolean(config.auth.vkid.appId);

export const initVkId = (app: Express) => {
    app.get(['/auth/vk', '/auth/vk/'], (req, res) => {
        if (!isVkIdEnabled()) {
            res.redirect('/login?error=vk_disabled');
            return;
        }

        const state = randomString(24);
        const verifier = randomString();
        const cookieOptions = {
            maxAge: FLOW_TTL_MS,
            httpOnly: true,
            sameSite: 'lax' as const,
            secure: isSecureRequest(req),
        };
        res.cookie(STATE_COOKIE, state, cookieOptions);
        res.cookie(VERIFIER_COOKIE, verifier, cookieOptions);

        const query = new URLSearchParams({
            response_type: 'code',
            client_id: config.auth.vkid.appId,
            redirect_uri: getRedirectUri(req),
            state,
            scope: SCOPE,
            code_challenge: codeChallenge(verifier),
            code_challenge_method: 's256',
        });
        res.redirect(`${VKID_URL}/authorize?${query}`);
    });

    app.get('/auth/vk/return', async (req, res, next) => {
        try {
            const params = readCallbackParams(req);
            const expectedState: string | undefined = req.cookies[STATE_COOKIE];
            const verifier: string | undefined = req.cookies[VERIFIER_COOKIE];

            if (params.error) {
                fail(res, 'authorize error', params);
                return;
            }
            if (!params.code || !params.device_id || !params.state || !expectedState || !verifier) {
                fail(res, 'missing callback params or flow cookies', Object.keys(params));
                return;
            }
            if (!safeEqual(params.state, expectedState)) {
                fail(res, 'state mismatch');
                return;
            }

            const token = await postVkId<VkIdTokenResponse>(
                '/oauth2/auth',
                {
                    grant_type: 'authorization_code',
                    redirect_uri: getRedirectUri(req),
                    client_id: config.auth.vkid.appId,
                    code_verifier: verifier,
                    state: expectedState,
                    device_id: params.device_id,
                },
                { code: params.code },
            );
            if (!token.access_token || token.error || (token.state && token.state !== expectedState)) {
                fail(res, 'code exchange failed', token.error ? token : 'no access_token / state mismatch');
                return;
            }

            const info = await postVkId<VkIdUserInfoResponse>(
                '/oauth2/user_info',
                { client_id: config.auth.vkid.appId },
                { access_token: token.access_token },
            );
            const vkUser = info.user;
            const vkUserId = String(vkUser?.user_id || token.user_id || '');
            if (!vkUserId || info.error) {
                fail(res, 'user_info failed', info);
                return;
            }

            res.clearCookie(STATE_COOKIE);
            res.clearCookie(VERIFIER_COOKIE);

            await signIn(req, res, {
                socialType: SocialType.VK,
                socialId: vkUserId,
                username: [vkUser?.first_name, vkUser?.last_name].filter(Boolean).join(' '),
                avatar: vkUser?.avatar || getDefaultAvatar(req),
            });

            res.redirect('/');
        } catch (e) {
            next(e);
        }
    });
};
