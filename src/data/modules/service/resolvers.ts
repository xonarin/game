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
    Mutation: {
        serviceResolveSocialUser: isService,
    },
};

export const resolvers = {
    Mutation: {
        serviceResolveSocialUser: async (
            _0: unknown,
            { type, socialId, username, avatar }: { type: string; socialId: string; username: string; avatar: string },
            { repositories }: ApolloContext,
        ) => {
            const [user, isNew] = await repositories.users.authSocial(
                toSocialType(type),
                socialId,
                username,
                avatar,
            );

            return { id: user.id, username: user.username, avatar: user.avatar, isNew };
        },
    },
};
