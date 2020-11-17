import passport from 'passport';
import { Strategy as VkStrategy, Profile as VkProfile, VerifyCallback as VkVerifyCallback } from 'passport-vkontakte';

import config from './config';
import { repositories } from './data/database';

/**
 * Sign in with VK.
 */
passport.use(
    new VkStrategy(
        {
            clientID: config.auth.vk.appId,
            clientSecret: config.auth.vk.appSecret,
            callbackURL: '/auth/vk/return',
            profileFields: ['photo_200'],
            apiVersion: '5.107',
        },
        async (_0: string, _1: string, profile: VkProfile, done: VkVerifyCallback) => {
            const [user, isRegistered] = await repositories.users.authVk(profile);

            done(null, { id: user.id }, { isRegistered });
        },
    ),
);

export default passport;
