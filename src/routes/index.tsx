/* eslint-disable global-require */
import React from 'react';
import { Route } from 'universal-router';

import { AppContextTypes } from '../context';
import { RouteResult } from '../router';
import Page from '../components/Page/Page';

// The top-level (parent) route
const routes: Route<AppContextTypes, RouteResult> = {
    path: '',

    // Keep in mind, routes are evaluated in order
    children: [
        {
            path: '',
            load: () => import(/* webpackChunkName: 'welcome' */ './welcome'),
        },
        {
            path: '/all-games',
            load: () => import(/* webpackChunkName: 'messages' */ './AllGames'),
        },
        {
            path: '/faq',
            load: () => import(/* webpackChunkName: 'messages' */ './Faq'),
        },
        {
            path: '/messages/:chatId?',
            load: () => import(/* webpackChunkName: 'messages' */ './messages'),
        },
        {
            path: '/classic',
            load: () => import(/* webpackChunkName: 'classic' */ './classic'),
        },
        {
            path: '/battle',
            load: () => import(/* webpackChunkName: 'battle' */ './battle'),
        },
        {
            path: '/mines',
            load: () => import(/* webpackChunkName: 'mines' */ './mines'),
        },

        // Wildcard routes, e.g. { path: '(.*)', ... } (must go last)
        {
            path: '(.*)',
            load: () => import(/* webpackChunkName: 'not-found' */ './not-found'),
        },
    ],

    async action({ next }) {
        // Execute each child route until one of them return the result
        const route = await next();

        // Provide default values for title, description etc.
        route.title = `${route.title || 'Untitled Page'} - PlayTime`;
        route.description = route.description || '';

        // Render page content wrapped in page if exists
        if (route.pageContent) {
            route.component = <Page>{route.pageContent}</Page>;
        }

        return route;
    },
};

// The error page is available by permanent url for development mode
if (__DEV__) {
    routes.children!.unshift({
        path: '/error',
        action: require('./error').default,
    });
}

export default routes;
