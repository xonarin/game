/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryParams, RouteContext, Context } from 'universal-router';

declare module 'universal-router' {
    interface LoadResult<C extends Context = any, R = any> {
        default(context: C & RouteContext<C, R>, params: QueryParams): R | Promise<R>;
    }

    interface Route<C extends Context = any, R = any> {
        load?: () => Promise<LoadResult<C, R>>;
    }
}
