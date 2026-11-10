/**
 * Google sign-in (OAuth 2.0 Authorization Code + PKCE).
 *   GET  https://accounts.google.com/o/oauth2/v2/auth  -> redirect back with code, state
 *   POST https://oauth2.googleapis.com/token           -> access_token, id_token
 *   GET  https://www.googleapis.com/oauth2/v3/userinfo -> { sub, name, picture, email }
 * The Google account id (`sub`) is stable per user, used as socialId (socialType=Google).
 * Register the redirect URI `<PUBLIC_URL>/auth/google/return` in the Google Cloud console.
 */
import crypto from 'crypto';
import { Express, Request, Response } from 'express';

import config from '../config';
import { SocialType } from '../data/models/User';
import { UserError } from '../utils/errors';
import { AuthOptions, getBaseUrl, getDefaultAvatar, isSecureRequest, signIn } from './session';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const SCOPE = 'openid email profile';
const STATE_COOKIE = 'google_state';
const VERIFIER_COOKIE = 'google_verifier';
const FLOW_TTL_MS = 10 * 60 * 1000;

const base64url = (buf: Buffer) => buf.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

const randomString = (bytes = 48) => base64url(crypto.randomBytes(bytes));

const codeChallenge = (verifier: string) => base64url(crypto.createHash('sha256').update(verifier).digest());

const getRedirectUri = (req: Request, publicUrl?: string) => `${getBaseUrl(req, publicUrl)}/auth/google/return`;

const safeEqual = (a: string, b: string) => {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

interface GoogleTokenResponse {
    access_token?: string;
    id_token?: string;
    error?: string;
    error_description?: string;
}

interface GoogleUserInfo {
    sub?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    email?: string;
    error?: string;
}

const fail = (res: Response, reason: string, loginPath: string, details?: unknown) => {
    console.error('[google]', reason, details === undefined ? '' : details);
    res.clearCookie(STATE_COOKIE);
    res.clearCookie(VERIFIER_COOKIE);
    res.redirect(`${loginPath}?error=google`);
};

export const isGoogleEnabled = () => Boolean(config.auth.google.clientId && config.auth.google.clientSecret);

export const initGoogle = (app: Express, options: AuthOptions = {}) => {
    const loginPath = options.loginPath || '/login';

    app.get(['/auth/google', '/auth/google/'], (req, res) => {
        if (!isGoogleEnabled()) {
            res.redirect(`${loginPath}?error=google_disabled`);
            return;
        }

        const state = randomString(24);
        const verifier = randomString();
        const cookieOptions = {
            maxAge: FLOW_TTL_MS,
            httpOnly: true,
            sameSite: 'lax' as const,
            secure: isSecureRequest(req, options.publicUrl),
        };
        res.cookie(STATE_COOKIE, state, cookieOptions);
        res.cookie(VERIFIER_COOKIE, verifier, cookieOptions);

        const query = new URLSearchParams({
            response_type: 'code',
            client_id: config.auth.google.clientId,
            redirect_uri: getRedirectUri(req, options.publicUrl),
            state,
            scope: SCOPE,
            code_challenge: codeChallenge(verifier),
            code_challenge_method: 'S256',
            // Keep it to the account chooser, no offline refresh token needed.
            prompt: 'select_account',
        });
        res.redirect(`${AUTH_URL}?${query}`);
    });

    app.get('/auth/google/return', async (req, res, next) => {
        try {
            const code = typeof req.query.code === 'string' ? req.query.code : '';
            const state = typeof req.query.state === 'string' ? req.query.state : '';
            const expectedState: string | undefined = req.cookies[STATE_COOKIE];
            const verifier: string | undefined = req.cookies[VERIFIER_COOKIE];

            if (req.query.error) {
                fail(res, 'authorize error', loginPath, req.query.error);
                return;
            }
            if (!code || !state || !expectedState || !verifier) {
                fail(res, 'missing callback params or flow cookies', loginPath);
                return;
            }
            if (!safeEqual(state, expectedState)) {
                fail(res, 'state mismatch', loginPath);
                return;
            }

            const tokenResp = await fetch(TOKEN_URL, {
                method: 'POST',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: getRedirectUri(req, options.publicUrl),
                    client_id: config.auth.google.clientId,
                    client_secret: config.auth.google.clientSecret,
                    code_verifier: verifier,
                }),
            });
            const token = (await tokenResp.json()) as GoogleTokenResponse;
            if (!token.access_token || token.error) {
                fail(res, 'code exchange failed', loginPath, token.error ? token : 'no access_token');
                return;
            }

            const infoResp = await fetch(USERINFO_URL, {
                headers: { authorization: `Bearer ${token.access_token}` },
            });
            const info = (await infoResp.json()) as GoogleUserInfo;
            const googleId = String(info.sub || '');
            if (!googleId || info.error) {
                fail(res, 'userinfo failed', loginPath, info.error || info);
                return;
            }

            res.clearCookie(STATE_COOKIE);
            res.clearCookie(VERIFIER_COOKIE);

            try {
                await signIn(
                    req,
                    res,
                    {
                        socialType: SocialType.Google,
                        socialId: googleId,
                        username:
                            info.name ||
                            [info.given_name, info.family_name].filter(Boolean).join(' ') ||
                            (info.email ? info.email.split('@')[0] : ''),
                        avatar: info.picture || getDefaultAvatar(req, options.publicUrl),
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
};
