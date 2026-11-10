import { Express } from 'express';

import config from '../config';
import { repositories } from '../data/database';
import { UserRole } from '../data/models/User';
import { issueSessionCookie, SessionTarget } from './session';

interface CallbackOptions {
    // Which cookie/secret to issue the site session into
    session: SessionTarget;
    // Restrict to this role (admin panel), otherwise redirect with error
    requireRole?: UserRole;
    // Where to go after a successful login
    successRedirect: string;
    // Where to send errors (e.g. '/login')
    loginPath: string;
}

interface VerifyResponse {
    userId?: string;
    isNew?: boolean;
    error?: string;
}

/**
 * Site side of the central auth broker: the broker redirects here with a one-time ?code=,
 * which we exchange (server-to-server) for the user, then set our own session cookie.
 */
// eslint-disable-next-line import/prefer-default-export
export const initAuthCallback = (app: Express, options: CallbackOptions) => {
    app.get('/auth/callback', async (req, res, next) => {
        const fail = (reason: string) => {
            console.warn('[auth/callback]', reason);
            res.redirect(`${options.loginPath}?error=auth`);
        };

        try {
            const code = typeof req.query.code === 'string' ? req.query.code : '';
            if (!code) {
                fail('no code');
                return;
            }

            const resp = await fetch(`${config.authService.internalUrl}/verify`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ code, secret: config.authService.sharedSecret }),
            });
            const data = (await resp.json()) as VerifyResponse;
            if (!resp.ok || !data.userId) {
                fail(`verify failed: ${data.error || resp.status}`);
                return;
            }

            const user = await repositories.users.getUserById(data.userId);
            if (!user) {
                fail('user not found');
                return;
            }

            if (options.requireRole && user.role !== options.requireRole) {
                res.redirect(`${options.loginPath}?error=not_admin`);
                return;
            }

            issueSessionCookie(req, res, user.id, options.session);

            // Apply the referral link for brand-new registrations (player site only).
            if (data.isNew && !options.requireRole) {
                const { refId } = req.cookies;
                if (refId) {
                    await repositories.users.setReferrer(user.id, refId).catch(() => undefined);
                    res.clearCookie('refId');
                }
            }

            res.redirect(options.successRedirect || '/');
        } catch (e) {
            next(e);
        }
    });
};
