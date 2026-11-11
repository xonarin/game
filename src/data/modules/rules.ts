import { rule } from 'graphql-shield';

import { UserError } from '../../utils/errors';
import { User, UserRole } from '../models/User';
import config from '../../config';
import { ApolloContext } from '../../interfaces/apollo';

export const isAuth = rule({ cache: 'contextual' })((_0, _1, ctx: { user?: User }) => {
    if (!ctx.user) {
        return new UserError('NOT_AUTH');
    }

    return true;
});

export const isAdmin = rule({ cache: 'contextual' })((_0, _1, ctx: { user?: User }) => {
    if (!ctx.user || ctx.user.role !== UserRole.Admin) {
        return new UserError('NOT_ADMIN');
    }

    return true;
});

/**
 * Server-to-server caller (the central auth service, plant-auth) authenticated by the shared
 * `X-Service-Token`. Guards the internal service operations on the shared /graphql endpoint.
 * A constant-time-ish length+value check; the token is a long random shared secret.
 */
export const isService = rule({ cache: 'contextual' })((_0, _1, ctx: ApolloContext) => {
    const expected = config.service.token;
    if (!expected || !ctx.serviceToken || ctx.serviceToken !== expected) {
        return new UserError('NOT_SERVICE');
    }

    return true;
});

export const isAdminOrModerator = rule({ cache: 'contextual' })((_0, _1, ctx: { user?: User }) => {
    if (!ctx.user || (ctx.user.role !== UserRole.Admin && ctx.user.role !== UserRole.Moderator)) {
        return new UserError('NOT_ADMIN_OR_MODERATOR');
    }

    return true;
});
