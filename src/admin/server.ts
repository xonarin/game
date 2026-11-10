// Sets the __DEV__ global before any config import — must stay first.
import './globals';

import path from 'path';
import fs from 'fs';
import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { expressjwt, UnauthorizedError as Jwt401Error } from 'express-jwt';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import depthLimit from 'graphql-depth-limit';

import config, { getConfigErrors } from '../config';
import { UserRole } from '../data/models/User';
import { initAuth } from '../auth';
import { createContext } from '../utils/apollo/createContext';
import { ApolloContext } from '../interfaces/apollo';
import { configureLuxon } from '../utils/luxon';
import AdminModule from './module';

process.on('unhandledRejection', (reason, p) => {
    console.error('[admin] Unhandled Rejection at:', p, 'reason:', reason);
    process.exit(1);
});

const configErrors = getConfigErrors();
if (configErrors.length > 0) {
    console.error(`[admin] invalid configuration:\n  - ${configErrors.join('\n  - ')}`);
    if (!__DEV__) process.exit(1);
}

configureLuxon();

const CLIENT_DIR = path.resolve(__dirname, 'client', 'dist');
const INDEX_HTML = path.join(CLIENT_DIR, 'index.html');

const start = async () => {
    const app = express();
    app.set('trust proxy', config.trustProxy);

    app.use(cookieParser());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Admin session: own cookie + secret, independent of the player site.
    app.use(
        expressjwt({
            secret: config.admin.jwt.secret,
            algorithms: ['HS256'],
            credentialsRequired: false,
            requestProperty: 'user',
            getToken: req => req.cookies[config.admin.tokenKey],
        }),
    );
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof Jwt401Error) {
            res.clearCookie(config.admin.tokenKey);
            // eslint-disable-next-line no-param-reassign
            req.user = undefined;
            next();
            return;
        }
        next(err);
    });

    // Social login on the admin domain: same providers, own cookie, admins only.
    initAuth(app, {
        session: {
            tokenKey: config.admin.tokenKey,
            secret: config.admin.jwt.secret,
            publicUrl: config.admin.publicUrl,
        },
        requireRole: UserRole.Admin,
        publicUrl: config.admin.publicUrl,
        successRedirect: '/',
        loginPath: '/login',
        // Dev login (/auth/dev?user=x) yields an admin so the panel can be tested locally.
        devPromoteRole: UserRole.Admin,
    });

    app.get('/logout', (_0, res) => {
        res.clearCookie(config.admin.tokenKey);
        res.redirect('/login');
    });

    // Build/version marker (used later by the deploy panel).
    app.get('/version', (_0, res) => {
        res.json({ sha: process.env.GIT_SHA || null, service: 'admin' });
    });

    const apolloServer = new ApolloServer<ApolloContext>({
        schema: AdminModule,
        introspection: __DEV__,
        includeStacktraceInErrorResponses: __DEV__,
        validationRules: [depthLimit(7)],
        plugins: [...(__DEV__ ? [] : [ApolloServerPluginLandingPageDisabled()])],
    });
    await apolloServer.start();
    app.use(
        '/graphql',
        expressMiddleware(apolloServer, {
            context: ({ req, res }) => createContext(req, res),
        }),
    );

    // Serve the built SPA (if present) and let the client router handle the rest.
    if (fs.existsSync(CLIENT_DIR)) {
        app.use(express.static(CLIENT_DIR));
    }
    app.get('/{*path}', (_req, res) => {
        if (fs.existsSync(INDEX_HTML)) {
            res.sendFile(INDEX_HTML);
            return;
        }
        res.status(200).type('text/plain').send('Admin API is running. SPA is not built yet.');
    });

    const { port } = config.admin;
    app.listen(port, () => {
        console.info(`[admin] listening on http://localhost:${port} (GraphQL at /graphql)`);
    });
};

start().catch(err => {
    console.error('[admin] failed to start:', err);
    process.exit(1);
});
