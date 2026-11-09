import UniversalRouter, { RouteParams, RouterOptions } from 'universal-router';
import { ReactNode } from 'react';

import { AppContextTypes } from './context';
import routes from './routes';

export interface RouteResult {
    title?: string;
    description?: string;
    component?: ReactNode;
    pageContent?: ReactNode;

    params?: RouteParams;
    redirect?: string;
    status?: number;

    chunk?: string;
    chunks?: string[];
}

const options: RouterOptions<RouteResult, AppContextTypes> = {
    resolveRoute(context, params) {
        if (typeof context.route.load === 'function') {
            return context.route
                .load()
                .then(action => action.default(context as AppContextTypes & typeof context, params))
                .then(route => ({ ...route, params }));
        }
        if (typeof context.route.action === 'function') {
            return context.route.action(context, params);
        }
        return undefined;
    },
};

const universalRouter = new UniversalRouter(routes, options);

// The wildcard route always matches, so a missing result is a programming error
const router = {
    async resolve(context: AppContextTypes): Promise<RouteResult> {
        const route = await universalRouter.resolve(context);
        if (!route) {
            throw new Error(`No route for ${context.pathname}`);
        }
        return route;
    },
};

export default router;
