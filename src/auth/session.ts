import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import config from '../config';
import { repositories } from '../data/database';
import { SocialType } from '../data/models/User';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 180; // 180 days

export const isSecureRequest = (req: Request) => req.secure || config.auth.publicUrl.startsWith('https://');

/**
 * Public base URL of the site, used for OAuth redirect URIs and default avatars.
 */
export const getBaseUrl = (req: Request): string => {
    if (config.auth.publicUrl) {
        return config.auth.publicUrl.replace(/\/+$/, '');
    }
    return `${req.protocol}://${req.get('host')}`;
};

export const getDefaultAvatar = (req: Request) => `${getBaseUrl(req)}/default-avatar.svg`;

export interface SocialProfile {
    socialType: SocialType;
    socialId: string;
    username: string;
    avatar: string;
}

/** Signs a session JWT for `userId` and sets it as the site session cookie. */
export const issueSessionCookie = (req: Request, res: Response, userId: string) => {
    const token = jwt.sign({ id: userId }, config.auth.jwt.secret, { expiresIn: SESSION_TTL_SECONDS });
    res.cookie(config.auth.tokenKey, token, {
        maxAge: 1000 * SESSION_TTL_SECONDS,
        // Not readable from JavaScript: an XSS cannot steal the session. The WebSocket
        // server reads the same cookie from the upgrade request (see getWebSocketUser).
        httpOnly: true,
        sameSite: 'lax',
        secure: isSecureRequest(req),
    });
};

/**
 * Finds or registers the user by social account, sets the session cookie
 * and applies the referral link (refId cookie) for newly registered users.
 */
export const signIn = async (req: Request, res: Response, profile: SocialProfile) => {
    const [user, isRegistered] = await repositories.users.authSocial(
        profile.socialType,
        profile.socialId,
        profile.username.slice(0, 64) || 'Player',
        profile.avatar,
    );

    // A Telegram login also counts as a linked Telegram account for the bonus.
    if (profile.socialType === SocialType.Telegram && !user.telegramId) {
        await repositories.users.linkTelegram(user.id, profile.socialId);
    }

    issueSessionCookie(req, res, user.id);

    const { refId } = req.cookies;
    if (refId && isRegistered) {
        await repositories.users.setReferrer(user.id, refId);
        res.clearCookie('refId');
    }

    return user;
};
