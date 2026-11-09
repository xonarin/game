/**
 * Steam sign-in (OpenID 2.0 — Steam does not support OAuth).
 *   GET  https://steamcommunity.com/openid/login?openid.mode=checkid_setup -> redirect back
 *   POST https://steamcommunity.com/openid/login?openid.mode=check_authentication -> is_valid:true
 * The claimed_id contains the 17-digit SteamID64, used as socialId (socialType=Steam).
 * Name and avatar come from the Steam Web API (GetPlayerSummaries), which needs STEAM_API_KEY
 * (https://steamcommunity.com/dev/apikey) — the key also gates whether the button is shown.
 */
import crypto from 'crypto';
import { Express, Request, Response } from 'express';

import config from '../config';
import { SocialType } from '../data/models/User';
import { getBaseUrl, getDefaultAvatar, isSecureRequest, signIn } from './session';

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';
const STEAM_SUMMARIES_URL = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/';
const STATE_COOKIE = 'steam_state';
const FLOW_TTL_MS = 10 * 60 * 1000;
const CLAIMED_ID_RE = /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/;

const base64url = (buf: Buffer) => buf.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

const randomString = (bytes = 24) => base64url(crypto.randomBytes(bytes));

const safeEqual = (a: string, b: string) => {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

const getReturnTo = (req: Request, state: string) => `${getBaseUrl(req)}/auth/steam/return?state=${state}`;

interface SteamPlayer {
    steamid?: string;
    personaname?: string;
    avatarfull?: string;
}

const fetchSteamProfile = async (steamId: string): Promise<SteamPlayer | null> => {
    try {
        const url = `${STEAM_SUMMARIES_URL}?key=${encodeURIComponent(config.auth.steam.apiKey)}&steamids=${steamId}`;
        const resp = await fetch(url);
        const json = (await resp.json()) as { response?: { players?: SteamPlayer[] } };
        return json.response?.players?.[0] ?? null;
    } catch {
        return null;
    }
};

const fail = (res: Response, reason: string, details?: unknown) => {
    console.error('[steam]', reason, details === undefined ? '' : details);
    res.clearCookie(STATE_COOKIE);
    res.redirect('/login?error=steam');
};

export const isSteamEnabled = () => Boolean(config.auth.steam.apiKey);

export const initSteam = (app: Express) => {
    app.get(['/auth/steam', '/auth/steam/'], (req, res) => {
        if (!isSteamEnabled()) {
            res.redirect('/login?error=steam_disabled');
            return;
        }

        const state = randomString();
        res.cookie(STATE_COOKIE, state, {
            maxAge: FLOW_TTL_MS,
            httpOnly: true,
            sameSite: 'lax',
            secure: isSecureRequest(req),
        });

        const params = new URLSearchParams({
            'openid.ns': 'http://specs.openid.net/auth/2.0',
            'openid.mode': 'checkid_setup',
            'openid.return_to': getReturnTo(req, state),
            'openid.realm': getBaseUrl(req),
            'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
            'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
        });
        res.redirect(`${STEAM_OPENID_URL}?${params}`);
    });

    app.get('/auth/steam/return', async (req, res, next) => {
        try {
            const query = req.query as Record<string, string | undefined>;
            const expectedState = req.cookies[STATE_COOKIE];
            const claimedId = query['openid.claimed_id'];

            if (
                !claimedId ||
                !expectedState ||
                typeof query.state !== 'string' ||
                !safeEqual(query.state, expectedState)
            ) {
                fail(res, 'missing params or state mismatch');
                return;
            }
            // The return_to Steam signed must be the one we issued (prevents cross-endpoint replay).
            if (query['openid.return_to'] !== getReturnTo(req, expectedState)) {
                fail(res, 'return_to mismatch');
                return;
            }

            // Re-send every openid.* param back to Steam to verify the signature.
            const verify = new URLSearchParams();
            Object.entries(query).forEach(([key, value]) => {
                if (key.startsWith('openid.') && typeof value === 'string') verify.append(key, value);
            });
            verify.set('openid.mode', 'check_authentication');

            const resp = await fetch(STEAM_OPENID_URL, {
                method: 'POST',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                body: verify,
            });
            const text = await resp.text();
            if (!/is_valid\s*:\s*true/i.test(text)) {
                fail(res, 'openid verification failed');
                return;
            }

            const match = CLAIMED_ID_RE.exec(claimedId);
            if (!match) {
                fail(res, 'bad claimed_id', claimedId);
                return;
            }
            const steamId = match[1];

            res.clearCookie(STATE_COOKIE);

            const profile = await fetchSteamProfile(steamId);
            await signIn(req, res, {
                socialType: SocialType.Steam,
                socialId: steamId,
                username: profile?.personaname || `Player ${steamId.slice(-4)}`,
                avatar: profile?.avatarfull || getDefaultAvatar(req),
            });

            res.redirect('/');
        } catch (e) {
            next(e);
        }
    });
};
