import { WithFilter } from 'graphql-subscriptions';

import pubsub, { AsyncIteratorResult, PubSubEvent } from '../data/pubsub';

interface WithFilterByTargetContext {
    user?: { id: string };
}

// Такой костыль нужен для переписывания оригинальной типизации
// eslint-disable-next-line prefer-destructuring,global-require
export const withFilter: WithFilter = require('graphql-subscriptions').withFilter;

export const withFilterByTarget = <
    TEvent extends PubSubEvent,
    TContext extends WithFilterByTargetContext,
    TParent,
    TArgs
>(
    trigger: TEvent,
) =>
    withFilter<TContext, TParent, TArgs, AsyncIteratorResult<TEvent>>(
        () => pubsub.asyncIterator(trigger),
        ({ target, invertTarget }, _0, { user }) =>
            !target || Boolean(user && target.includes(user.id) !== Boolean(invertTarget)),
    );
