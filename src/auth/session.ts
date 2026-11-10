import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import config from '../config';
import { repositories } from '../data/database';
import { SocialType, UserRole } from '../data/models/User';
import { UserError } from '../utils/errors';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 180; // 180 days

/** Which cookie/secret a session is issued into — the player site and the admin panel use different ones. */
export interface SessionTarget {
    tokenKey: string;
    secret: string;
    // Public base URL of this domain (OAuth redirect URIs, default avatars); empty => derive from request.
    publicUrl: string;
}

export const gameSession = (): SessionTarget => ({
    tokenKey: config.auth.tokenKey,
    secret: config.auth.jwt.secret,
    publicUrl: config.auth.publicUrl,
});

export const isSecureRequest = (req: Request, publicUrl = config.auth.publicUrl) =>
    req.secure || publicUrl.startsWith('https://');

/**
 * Public base URL of the site, used for OAuth redirect URIs and default avatars.
 * `publicUrl` overrides the default (used by the admin domain).
 */
export const getBaseUrl = (req: Request, publicUrl = config.auth.publicUrl): string => {
    if (publicUrl) {
        return publicUrl.replace(/\/+$/, '');
    }
    return `${req.protocol}://${req.get('host')}`;
};

export const getDefaultAvatar = (req: Request, publicUrl?: string) =>
    `${getBaseUrl(req, publicUrl)}/default-avatar.svg`;

export interface SocialProfile {
    socialType: SocialType;
    socialId: string;
    username: string;
    avatar: string;
}

/** Signs a session JWT for `userId` and sets it as the session cookie of `session`. */
export const issueSessionCookie = (req: Request, res: Response, userId: string, session: SessionTarget) => {
    const token = jwt.sign({ id: userId }, session.secret, { expiresIn: SESSION_TTL_SECONDS });
    res.cookie(session.tokenKey, token, {
        maxAge: 1000 * SESSION_TTL_SECONDS,
        // Not readable from JavaScript: an XSS cannot steal the session. The WebSocket
        // server reads the same cookie from the upgrade request (see getWebSocketUser).
        httpOnly: true,
        sameSite: 'lax',
        secure: isSecureRequest(req, session.publicUrl),
    });
};

export interface SignInOptions {
    // Cookie/secret to issue the session into (defaults to the player site).
    session?: SessionTarget;
    // If set, the signed-in user must have this role, otherwise NOT_ADMIN is thrown and no cookie is set.
    requireRole?: UserRole;
}

/**
 * Options that let the same auth routes serve two domains: the player site (defaults)
 * and the admin panel (own cookie/secret, own public URL, admin-only).
 */
export interface AuthOptions {
    // Cookie/secret to issue the session into (defaults to the player site).
    session?: SessionTarget;
    // Providers reject non-matching roles (admin panel sets UserRole.Admin).
    requireRole?: UserRole;
    // Base URL for OAuth redirect URIs on this domain (defaults to config.auth.publicUrl).
    publicUrl?: string;
    // Where to send the browser after a successful login (default '/').
    successRedirect?: string;
    // Base path for error redirects (default '/login').
    loginPath?: string;
    // Dev login only: promote the created dev user to this role (so the admin dev login yields an admin).
    devPromoteRole?: UserRole;
    // Broker mode: fully handles the terminal step (instead of setting a cookie + redirecting).
    // The central auth service uses this to mint a one-time code and redirect back to the origin site.
    complete?: (req: Request, res: Response, profile: SocialProfile) => Promise<void>;
}

/**
 * Terminal step shared by all providers: either the broker's custom handler (options.complete),
 * or the default — set the site session cookie and redirect (with an admin-role gate when requested).
 */
export const finishLogin = async (
    req: Request,
    res: Response,
    profile: SocialProfile,
    options: AuthOptions,
): Promise<void> => {
    if (options.complete) {
        await options.complete(req, res, profile);
        return;
    }

    const loginPath = options.loginPath || '/login';
    try {
        // eslint-disable-next-line no-use-before-define -- signIn is defined below in the same module
        await signIn(req, res, profile, { session: options.session, requireRole: options.requireRole });
    } catch (e) {
        if (e instanceof UserError && e.message === 'NOT_ADMIN') {
            res.redirect(`${loginPath}?error=not_admin`);
            return;
        }
        throw e;
    }
    res.redirect(options.successRedirect || '/');
};

/**
 * Finds or registers the user by social account, sets the session cookie
 * and applies the referral link (refId cookie) for newly registered users.
 * With `requireRole`, rejects users that do not have that role (used by the admin panel).
 */
export const signIn = async (req: Request, res: Response, profile: SocialProfile, options: SignInOptions = {}) => {
    const session = options.session || gameSession();

    const [user, isRegistered] = await repositories.users.authSocial(
        profile.socialType,
        profile.socialId,
        profile.username.slice(0, 64) || 'Player',
        profile.avatar,
    );

    // Admin panel: only admins may obtain an admin session.
    if (options.requireRole && user.role !== options.requireRole) {
        throw new UserError('NOT_ADMIN');
    }

    // A Telegram login also counts as a linked Telegram account for the bonus.
    if (profile.socialType === SocialType.Telegram && !user.telegramId) {
        await repositories.users.linkTelegram(user.id, profile.socialId);
    }

    issueSessionCookie(req, res, user.id, session);

    // Referral linking applies to player registrations only, not admin logins.
    if (!options.requireRole) {
        const { refId } = req.cookies;
        if (refId && isRegistered) {
            await repositories.users.setReferrer(user.id, refId);
            res.clearCookie('refId');
        }
    }

    return user;
};
