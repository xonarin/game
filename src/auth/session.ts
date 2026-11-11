import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import config from '../config';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 180; // 180 days

export const isSecureRequest = (req: Request) => req.secure || config.auth.publicUrl.startsWith('https://');

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
