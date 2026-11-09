/* eslint-disable @typescript-eslint/no-explicit-any */
import { RouteContext, RouteParams, RouterContext } from 'universal-router';

// Routes may lazy-load their action from a separate chunk: { path, load: () => import('./page') }
declare module 'universal-router' {
    interface LoadResult<R = any, C extends RouterContext = any> {
        default(context: C & RouteContext<R, C>, params: RouteParams): R | Promise<R>;
    }

    interface Route<R = any, C extends RouterContext = RouterContext> {
        load?: () => Promise<LoadResult<R, C>>;
    }
}
