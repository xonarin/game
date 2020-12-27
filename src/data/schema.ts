// NOTE: This file intended only for importing in codegen
import { mergeTypeDefs } from '@graphql-tools/merge';

import users from './modules/users/schema.graphql';
import referrals from './modules/referrals/schema.graphql';
import chat from './modules/chat/schema.graphql';
import announcements from './modules/announcements/schema.graphql';
import classicGame from './modules/classicGame/schema.graphql';
import minesGame from './modules/minesGame/schema.graphql';
import clientSchema from './modules/clientState/schema';

export default mergeTypeDefs([users, referrals, chat, announcements, classicGame, minesGame, ...clientSchema]);
