import 'graphql-subscriptions';
import { GraphQLResolveInfo } from 'graphql';

interface FilterFn<TContext, TParent, TArgs> {
    (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo): boolean | Promise<boolean>;
}

interface ResolverFn<TContext, TParent, TArgs, TResult> {
    (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo): AsyncIterator<TResult>;
}

declare module 'graphql-subscriptions' {
    interface WithFilter {
        <TContext, TParent, TArgs, TResult>(
            asyncIteratorFn: ResolverFn<TContext, TParent, TArgs, TResult>,
            filterFn: FilterFn<TContext, TResult, TArgs>,
        ): ResolverFn<TContext, TParent, TArgs, TResult>;
    }
}
