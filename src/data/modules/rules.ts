import { rule } from 'graphql-shield';

import { UserError } from '../../utils/errors';
import { User, UserRole } from '../models/User';
import { isMaintenance } from '../../utils/maintenance';

/** Blocks player mutations while the site is in maintenance mode (deploys). Admins bypass. */
export const notMaintenance = rule({ cache: 'contextual' })(async (_0, _1, ctx: { user?: User }) => {
    if (ctx.user && ctx.user.role === UserRole.Admin) {
        return true;
    }
    if (await isMaintenance()) {
        return new UserError('MAINTENANCE');
    }
    return true;
});

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

export const isAdminOrModerator = rule({ cache: 'contextual' })((_0, _1, ctx: { user?: User }) => {
    if (!ctx.user || (ctx.user.role !== UserRole.Admin && ctx.user.role !== UserRole.Moderator)) {
        return new UserError('NOT_ADMIN_OR_MODERATOR');
    }

    return true;
});
