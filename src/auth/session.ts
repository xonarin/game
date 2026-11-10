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
}

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

    const token = jwt.sign({ id: user.id }, session.secret, { expiresIn: SESSION_TTL_SECONDS });
    res.cookie(session.tokenKey, token, {
        maxAge: 1000 * SESSION_TTL_SECONDS,
        // Not readable from JavaScript: an XSS cannot steal the session. The WebSocket
        // server reads the same cookie from the upgrade request (see getWebSocketUser).
        httpOnly: true,
        sameSite: 'lax',
        secure: isSecureRequest(req, session.publicUrl),
    });

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
