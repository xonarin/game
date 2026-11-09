/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path';
import express, { Request, Response, Application } from 'express';
import browserSync from 'browser-sync';
import webpack, { Compiler, Configuration } from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import webpackConfig from './webpack.config';
import run, { format } from './run';
import clean from './clean';

const isDebug = !process.argv.includes('--release');

// https://webpack.js.org/configuration/watch/#watchoptions
const watchOptions = {
    // Watching may not work with NFS and machines in VirtualBox
    // Uncomment next line if it is your case (use true or interval in milliseconds)
    // poll: true,
    // Decrease CPU or memory usage in some file systems
    // ignored: /node_modules/,
};

function createCompilationPromise(name: string, compiler: Compiler, config: Configuration) {
    return new Promise((resolve, reject) => {
        let timeStart = new Date();
        compiler.hooks.compile.tap(name, () => {
            timeStart = new Date();
            console.info(`[${format(timeStart)}] Compiling '${name}'...`);
        });

        compiler.hooks.done.tap(name, stats => {
            console.info(stats.toString(config.stats));
            const timeEnd = new Date();
            const time = timeEnd.getTime() - timeStart.getTime();
            if (stats.hasErrors()) {
                console.info(`[${format(timeEnd)}] Failed to compile '${name}' after ${time} ms`);
                reject(new Error('Compilation failed!'));
            } else {
                console.info(`[${format(timeEnd)}] Finished '${name}' compilation after ${time} ms`);
                resolve(stats);
            }
        });
    });
}

let server: Application;

/**
 * Launches a development web server with "live reload" functionality -
 * synchronizing URLs, interactions and code changes across multiple devices.
 */
async function start() {
    if (server) return server;
    server = express();
    // Dev bundles have fixed names (client.js, ...), so a CDN/proxy in front of the
    // dev server (Cloudflare Tunnel for dev.plant.cash) would serve stale code. Never cache in dev.
    server.use((_req: Request, res: Response, next: () => void) => {
        res.setHeader('Cache-Control', 'no-store');
        next();
    });
    server.use(express.static(path.resolve(__dirname, '../public')));

    // Configure client-side hot module replacement
    const clientConfig = webpackConfig.find(config => config.name === 'client') as any;
    // webpack-hot-middleware client: applies updates, falls back to a full reload
    clientConfig.entry.client = ['webpack-hot-middleware/client?name=client&reload=true'].concat(
        clientConfig.entry.client,
    );
    clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

    // Configure server-side hot module replacement
    const serverConfig = webpackConfig.find(config => config.name === 'server') as any;
    serverConfig.output.hotUpdateMainFilename = 'updates/[runtime].[fullhash].hot-update.json';
    serverConfig.output.hotUpdateChunkFilename = 'updates/[id].[fullhash].hot-update.js';
    serverConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

    // Configure compilation
    await run(clean);
    const multiCompiler = webpack(webpackConfig as Configuration[]);
    const clientCompiler = multiCompiler.compilers.find(compiler => compiler.name === 'client')!;
    const serverCompiler = multiCompiler.compilers.find(compiler => compiler.name === 'server')!;
    const clientPromise = createCompilationPromise('client', clientCompiler, clientConfig)!;
    const serverPromise = createCompilationPromise('server', serverCompiler, serverConfig);

    // https://github.com/webpack/webpack-dev-middleware
    server.use(
        webpackDevMiddleware(clientCompiler, {
            publicPath: clientConfig.output.publicPath,
            stats: 'none',
        }),
    );

    // https://github.com/glenjamin/webpack-hot-middleware
    server.use(webpackHotMiddleware(clientCompiler, { log: false }));

    let app: Application;
    let hot: any;
    function reloadApp() {
        delete require.cache[require.resolve('../build/server')];
        if (app) {
            app.server.close();
        }
        // eslint-disable-next-line global-require
        const compiled = require('../build/server');
        app = compiled.default;
        hot = compiled.hot;
    }

    let appPromise: Promise<void>;
    let appPromiseResolve: Function;
    let appPromiseIsResolved = true;
    serverCompiler.hooks.compile.tap('server', () => {
        if (!appPromiseIsResolved) return;
        appPromiseIsResolved = false;
        // eslint-disable-next-line no-return-assign
        appPromise = new Promise(resolve => (appPromiseResolve = resolve));
    });

    server.use((req: Request, res: Response) => {
        appPromise.then(() => app.handle(req, res)).catch(error => console.error(error));
    });

    function checkForUpdate(fromUpdate?: boolean) {
        const hmrPrefix = '[\x1b[35mHMR\x1b[0m] ';
        if (!hot) {
            throw new Error(`${hmrPrefix}Hot Module Replacement is disabled.`);
        }
        if (hot.status() !== 'idle') {
            return Promise.resolve();
        }
        return hot
            .check(true)
            .then((updatedModules: string[]) => {
                if (!updatedModules) {
                    if (fromUpdate) {
                        console.info(`${hmrPrefix}Update applied.`);
                    }
                    return;
                }
                if (updatedModules.length === 0) {
                    console.info(`${hmrPrefix}Nothing hot updated.`);
                } else {
                    console.info(`${hmrPrefix}Updated modules:`);
                    updatedModules.forEach(moduleId => console.info(`${hmrPrefix} - ${moduleId}`));
                    checkForUpdate(true);
                }
            })
            .catch((error: Error) => {
                if (['abort', 'fail'].includes(hot.status())) {
                    console.warn(`${hmrPrefix}Cannot apply update.`);
                    reloadApp();
                    console.warn(`${hmrPrefix}App has been reloaded.`);
                } else {
                    console.warn(`${hmrPrefix}Update failed: ${error.stack || error.message}`);
                }
            });
    }

    serverCompiler.watch(watchOptions, (error, stats) => {
        if (app && !error && !stats.hasErrors()) {
            checkForUpdate().then(() => {
                appPromiseIsResolved = true;
                appPromiseResolve();
            });
        }
    });

    // Wait until both client-side and server-side bundles are ready
    await clientPromise;
    await serverPromise;

    const timeStart = new Date();
    console.info(`[${format(timeStart)}] Launching server...`);

    // Load compiled src/server.js as a middleware
    // eslint-disable-next-line global-require, import/no-unresolved
    reloadApp();
    appPromiseIsResolved = true;
    // noinspection JSUnusedAssignment
    appPromiseResolve!();

    const port = process.env.PORT ? Number(process.env.PORT) : undefined;

    // Launch the development server with Browsersync and HMR
    await new Promise((resolve, reject) =>
        browserSync.create().init(
            {
                // https://www.browsersync.io/docs/options
                server: { baseDir: '../public' },
                middleware: [server],
                // Don't mirror clicks/scroll/forms between all open tabs and devices
                // (it made separate users' tabs on dev.plant.cash drive each other)
                ghostMode: false,
                open: process.argv.includes('--silent') ? false : 'local',
                ...(isDebug ? {} : { notify: false, ui: {} }),
                ...(port ? { port } : null),
            },
            (error, bs) => (error ? reject(error) : resolve(bs)),
        ),
    );

    const timeEnd = new Date();
    const time = timeEnd.getTime() - timeStart.getTime();
    console.info(`[${format(timeEnd)}] Server launched after ${time} ms`);
    return server;
}

export default start;
