// NOTE: This file intended only for importing in codegen
import { mergeTypeDefs } from '@graphql-tools/merge';

import users from './modules/users/schema.graphql';
import referrals from './modules/referrals/schema.graphql';
import chat from './modules/chat/schema.graphql';
import liveData from './modules/liveData/schema.graphql';
import announcements from './modules/announcements/schema.graphql';
import classicGame from './modules/classicGame/schema.graphql';
import minesGame from './modules/minesGame/schema.graphql';
import tournaments from './modules/tournaments/schema.graphql';
import payments from './modules/payments/schema.graphql';
import bonus from './modules/bonus/schema.graphql';
import clientSchema from './modules/clientState/schema';

export default mergeTypeDefs([
    users,
    referrals,
    chat,
    liveData,
    announcements,
    classicGame,
    minesGame,
    tournaments,
    payments,
    bonus,
    ...clientSchema,
]);
