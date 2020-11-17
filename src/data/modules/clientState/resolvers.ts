import { merge } from 'lodash';

import { defaults as notificationsDefaults, resolvers as notificationsResolvers } from './notifications/resolvers';

export const defaults = merge(notificationsDefaults);
export const resolvers = merge(notificationsResolvers);
