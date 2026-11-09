import React, { useLayoutEffect } from 'react';
import { hydrateRoot, Root } from 'react-dom/client';
import queryString from 'query-string';
import { Action, Location } from 'history';

import App from './components/App';
import history from './history';
import { updateMeta } from './DOMUtils';
import createApolloClient from './utils/apollo/createApolloClient.client';
import router from './router';
import { AppContextTypes } from './context';
import { configureLuxon } from './utils/luxon';

configureLuxon();

const apolloClient = createApolloClient();

// Enables critical path CSS rendering
// https://github.com/kriasoft/isomorphic-style-loader
const insertCss = (...styles: { _insertCss(): () => {} }[]) => {
    // eslint-disable-next-line no-underscore-dangle
    const removeCss = styles.map(x => x._insertCss());
    return () => {
        removeCss.forEach(f => f());
    };
};

// Global (context) variables that can be easily accessed from any React component
// https://facebook.github.io/react/docs/context.html
const context: AppContextTypes = window.App.context; // eslint-disable-line prefer-destructuring

const container = document.getElementById('app')!;
let currentLocation = history.location;
let root: Root | null = null;

/** Calls `onRendered` after React has committed the tree to the DOM (replaces the old render callback). */
const AfterRender: React.FC<{ onRendered: () => void; children: React.ReactNode }> = ({ onRendered, children }) => {
    useLayoutEffect(onRendered, [onRendered]);
    return <>{children}</>;
};

const scrollPositionsHistory: {
    [key: string]: { scrollX: number; scrollY: number };
} = {};

// Re-render the app when window.location changes
async function onLocationChange(location: Location, action?: Action) {
    // Remember the latest scroll position for the previous location
    scrollPositionsHistory[currentLocation.key || ''] = {
        scrollX: window.pageXOffset,
        scrollY: window.pageYOffset,
    };
    // Delete stored scroll position for next page if any
    if (action === 'PUSH') {
        delete scrollPositionsHistory[location.key || ''];
    }
    currentLocation = location;

    const isInitialRender = !action;
    try {
        context.pathname = location.pathname;
        context.domain = window.location.host;
        // @ts-ignore TODO
        context.query = queryString.parse(location.search);

        // Traverses the list of routes in the order they are defined until
        // it finds the first route that matches provided URL path string
        // and whose action method returns anything other than `undefined`.
        const route = await router.resolve(context);

        context.params = route.params;

        // Prevent multiple page renders during the routing process
        if (currentLocation.key !== location.key) {
            return;
        }

        if (route.redirect) {
            history.replace(route.redirect);
            return;
        }

        const onRendered = () => {
            if (isInitialRender) {
                // Switch off the native scroll restoration behavior and handle it manually
                // https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
                if (window.history && 'scrollRestoration' in window.history) {
                    window.history.scrollRestoration = 'manual';
                }

                const elem = document.getElementById('css');
                if (elem) elem.parentNode!.removeChild(elem);
                return;
            }

            document.title = route.title!;

            updateMeta('description', route.description!);
            // Update necessary tags in <head> at runtime here, ie:
            // updateMeta('keywords', route.keywords);
            // updateCustomMeta('og:url', route.canonicalUrl);
            // updateCustomMeta('og:image', route.imageUrl);
            // updateLink('canonical', route.canonicalUrl);
            // etc.

            let scrollX = 0;
            let scrollY = 0;
            const pos = scrollPositionsHistory[location.key || ''];
            if (pos) {
                scrollX = pos.scrollX;
                scrollY = pos.scrollY;
            } else {
                const targetHash = location.hash.substr(1);
                if (targetHash) {
                    const target = document.getElementById(targetHash);
                    if (target) {
                        scrollY = window.pageYOffset + target.getBoundingClientRect().top;
                    }
                }
            }

            // Restore the scroll position if it was saved into the state
            // or scroll to the given #hash anchor
            // or scroll to top of the page
            window.scrollTo(scrollX, scrollY);
        };

        const element = (
            <AfterRender onRendered={onRendered}>
                <App client={apolloClient} context={context} insertCss={insertCss}>
                    {route.component}
                </App>
            </AfterRender>
        );

        if (!root) {
            // first render: attach to the server-rendered markup
            root = hydrateRoot(container, element);
        } else {
            root.render(element);
        }
    } catch (error) {
        if (__DEV__) {
            throw error;
        }

        console.error(error);

        // Do a full page reload if error occurs during client-side navigation
        if (!isInitialRender && currentLocation.key === location.key) {
            console.error('RSK will reload your page after error');
            window.location.reload();
        }
    }
}

// Handle client-side navigation by using HTML5 History API
// For more information visit https://github.com/mjackson/history#readme
history.listen(onLocationChange);
onLocationChange(currentLocation);

// Enable Hot Module Replacement (HMR)
if (module.hot) {
    module.hot.accept('./router', () => {
        onLocationChange(currentLocation);
    });
}
