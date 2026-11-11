import { IRules } from 'graphql-shield';

import { ApolloContext } from '../../../interfaces/apollo';
import { SocialType } from '../../models/User';
import { UserError } from '../../../utils/errors';
import { isService } from '../rules';

const toSocialType = (value: string): SocialType => {
    if ((Object.values(SocialType) as string[]).includes(value)) {
        return value as SocialType;
    }
    throw new UserError('INVALID_SOCIAL_TYPE');
};

export const rules: IRules = {
    Query: {
        serviceIsAllowedOrigin: isService,
        serviceVerifyClientSecret: isService,
    },
    Mutation: {
        serviceResolveSocialUser: isService,
    },
};

export const resolvers = {
    Query: {
        serviceIsAllowedOrigin: (_0: unknown, { origin }: { origin: string }, { repositories }: ApolloContext) =>
            repositories.authClients.isAllowed(origin),

        serviceVerifyClientSecret: (
            _0: unknown,
            { origin, secret }: { origin: string; secret: string },
            { repositories }: ApolloContext,
        ) => repositories.authClients.verifySecret(origin, secret),
    },
    Mutation: {
        serviceResolveSocialUser: async (
            _0: unknown,
            { type, socialId, username, avatar }: { type: string; socialId: string; username: string; avatar: string },
            { repositories }: ApolloContext,
        ) => {
            const socialType = toSocialType(type);
            const [user, isNew] = await repositories.users.authSocial(
                socialType,
                socialId,
                username.slice(0, 64) || 'Player',
                avatar,
            );

            // A Telegram login also counts as a linked Telegram account for the bonus.
            if (socialType === SocialType.Telegram && !user.telegramId) {
                await repositories.users.linkTelegram(user.id, socialId);
            }

            return { id: user.id, username: user.username, avatar: user.avatar, isNew };
        },
    },
};
