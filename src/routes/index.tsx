/* eslint-disable global-require */
import React from 'react';
import { Route } from 'universal-router';

import { AppContextTypes } from '../context';
import { RouteResult } from '../router';
import Page from '../components/Page/Page';

// The top-level (parent) route
const routes: Route<RouteResult, AppContextTypes> = {
    path: '',

    // Keep in mind, routes are evaluated in order
    children: [
        {
            // Lobby is the home page (the old /casino)
            path: '',
            load: () => import(/* webpackChunkName: 'casino' */ './AllGames'),
        },
        {
            path: '/login',
            load: () => import(/* webpackChunkName: 'login' */ './login'),
        },
        {
            path: '/balance',
            load: () => import(/* webpackChunkName: 'balance' */ './balance'),
        },
        {
            // Old lobby URL, kept for bookmarks and external links
            path: '/casino',
            action: () => ({ redirect: '/', status: 301 }),
        },
        {
            path: '/bonuse',
            load: () => import(/* webpackChunkName: 'prize' */ './prize'),
        },
        {
            path: '/faq',
            load: () => import(/* webpackChunkName: 'faq' */ './Faq'),
        },
        {
            path: '/tournaments',
            load: () => import(/* webpackChunkName: 'bonuse' */ './bonuse'),
        },
        {
            path: '/partners',
            load: () => import(/* webpackChunkName: 'partners' */ './referals'),
        },
        {
            path: '/profile',
            load: () => import(/* webpackChunkName: 'profile' */ './profile'),
        },
        {
            path: '/mines',
            load: () => import(/* webpackChunkName: 'mines' */ './mines'),
        },
        {
            path: '/classic',
            load: () => import(/* webpackChunkName: 'classic' */ './classic'),
        },
        {
            path: '/classic-history',
            load: () => import(/* webpackChunkName: 'classic-history' */ './classic-history'),
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
        route.title = `${route.title || 'Untitled Page'} - Willy`;
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
