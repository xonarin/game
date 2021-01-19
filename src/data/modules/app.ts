import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';
import { shield } from 'graphql-shield';

import usersTypeDefs from './users/schema.graphql';
import { rules as usersRules, resolvers as usersResolvers } from './users/resolvers';
import referralsTypeDefs from './referrals/schema.graphql';
import { rules as referralsRules, resolvers as referralsResolvers } from './referrals/resolvers';
import chatTypeDefs from './chat/schema.graphql';
import { rules as chatRules, resolvers as chatResolvers } from './chat/resolvers';
import liveDataTypeDefs from './liveData/schema.graphql';
import { resolvers as liveDataResolvers } from './liveData/resolvers';
import announcementsTypeDefs from './announcements/schema.graphql';
import { rules as announcementsRules, resolvers as announcementsResolvers } from './announcements/resolvers';
import classicGameTypeDefs from './classicGame/schema.graphql';
import { rules as classicGameRules, resolvers as classicGameResolvers } from './classicGame/resolvers';
import minesGameTypeDefs from './minesGame/schema.graphql';
import { rules as minesGameRules, resolvers as minesGameResolvers } from './minesGame/resolvers';
import { resolvers as tournamentsResolvers } from './tournaments/resolvers';
import tournamentsTypeDefs from './tournaments/schema.graphql';
import { rules as paymentRules, resolvers as paymentsResolvers } from './payments/resolvers';
import paymentsTypeDefs from './payments/schema.graphql';
import { rules as bonusRules, resolvers as bonusResolvers } from './bonus/resolvers';
import bonusTypeDefs from './bonus/schema.graphql';
import shieldConfig from '../../utils/graphql-shield/config';

const typeDefs = mergeTypeDefs([
    usersTypeDefs,
    referralsTypeDefs,
    chatTypeDefs,
    liveDataTypeDefs,
    announcementsTypeDefs,
    classicGameTypeDefs,
    minesGameTypeDefs,
    tournamentsTypeDefs,
    paymentsTypeDefs,
    bonusTypeDefs,
]);

const resolvers = mergeResolvers([
    usersResolvers,
    referralsResolvers,
    chatResolvers,
    liveDataResolvers,
    announcementsResolvers,
    classicGameResolvers,
    minesGameResolvers,
    tournamentsResolvers,
    paymentsResolvers,
    bonusResolvers,
]);

const schema = applyMiddleware(
    makeExecutableSchema({ typeDefs, resolvers }),
    shield(usersRules, shieldConfig),
    shield(referralsRules, shieldConfig),
    shield(chatRules, shieldConfig),
    shield(announcementsRules, shieldConfig),
    shield(classicGameRules, shieldConfig),
    shield(minesGameRules, shieldConfig),
    shield(paymentRules, shieldConfig),
    shield(bonusRules, shieldConfig),
);

export default schema;
