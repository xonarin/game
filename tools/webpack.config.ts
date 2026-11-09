/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import overrideRules from './lib/overrideRules';
import postcssConfig from './postcss.config';

const ROOT_DIR = path.resolve(__dirname, '..');
const resolvePath = (...args: string[]) => path.resolve(ROOT_DIR, ...args);
const SRC_DIR = resolvePath('src');
const BUILD_DIR = resolvePath('build');

const isDebug = !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose');
const isAnalyze = process.argv.includes('--analyze') || process.argv.includes('--analyse');

const reScript = /\.(ts|tsx|js|jsx|mjs)$/;
const reGraphql = /\.(graphql|gql)$/;
const reStyle = /\.(css|less|styl|scss|sass|sss)$/;
const reImage = /\.(bmp|gif|jpg|jpeg|png|svg|webp)$/;

const staticAssetName = isDebug ? '[path][name].[contenthash:8][ext]' : '[contenthash:8][ext]';

/**
 * Writes build/chunk-manifest.json: { [chunkGroupName]: [public paths of its JS/CSS files] }.
 * The server (src/server.tsx) uses it to add <script> tags for the route's chunks.
 */
class ChunkManifestPlugin {
    apply(compiler: webpack.Compiler) {
        compiler.hooks.done.tap('ChunkManifestPlugin', stats => {
            const { publicPath } = stats.compilation.outputOptions;
            const manifest: Record<string, string[]> = {};
            stats.compilation.namedChunkGroups.forEach((group, name) => {
                manifest[name] = group
                    .getFiles()
                    .filter(file => !file.endsWith('.map') && !file.includes('.hot-update.'))
                    .map(file => `${publicPath}${file}`);
            });
            fs.mkdirSync(BUILD_DIR, { recursive: true });
            fs.writeFileSync(`${BUILD_DIR}/chunk-manifest.json`, JSON.stringify(manifest, null, 2));
        });
    }
}

const babelOptions = (envPreset: object) => ({
    cacheDirectory: isDebug,
    babelrc: false,
    configFile: false,
    presets: [
        ['@babel/preset-env', envPreset],
        ['@babel/preset-react', { development: isDebug, runtime: 'classic' }],
        '@babel/preset-typescript',
    ],
    plugins: ['@babel/plugin-transform-runtime'],
});

//
// Common configuration chunk to be used for both
// client-side (client.js) and server-side (server.js) bundles
// -----------------------------------------------------------------------------

const config: webpack.Configuration = {
    context: ROOT_DIR,

    mode: isDebug ? 'development' : 'production',

    output: {
        path: resolvePath(BUILD_DIR, 'public/assets'),
        publicPath: '/assets/',
        pathinfo: isVerbose,
        filename: isDebug ? '[name].js' : '[name].[contenthash:8].js',
        chunkFilename: isDebug ? '[name].chunk.js' : '[name].[contenthash:8].chunk.js',
        assetModuleFilename: staticAssetName,
        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: (info: any) => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },

    module: {
        // Make missing exports an error instead of warning
        strictExportPresence: true,

        rules: [
            // Rules for JS / JSX / TS
            {
                test: reScript,
                include: [SRC_DIR, resolvePath('tools')],
                loader: 'babel-loader',
                options: babelOptions({ modules: false, useBuiltIns: false }),
            },

            // Rules for GraphQL
            {
                test: reGraphql,
                exclude: /node_modules/,
                loader: 'graphql-tag/loader',
            },

            // Rules for Style Sheets
            {
                test: reStyle,
                rules: [
                    // Convert CSS into JS module (supports server-side critical CSS)
                    {
                        issuer: { not: [reStyle] },
                        use: 'isomorphic-style-loader',
                    },

                    // Process external/third-party styles
                    {
                        exclude: SRC_DIR,
                        loader: 'css-loader',
                        options: {
                            sourceMap: isDebug,
                            esModule: false,
                        },
                    },

                    // Process internal/project styles (from src folder)
                    {
                        include: SRC_DIR,
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            sourceMap: isDebug,
                            esModule: false,
                            // Root-relative URLs (/gem.svg, /coming-soon.cur) point to files in public/, keep as is
                            url: { filter: (url: string) => !url.startsWith('/') },
                            // CSS Modules https://github.com/css-modules/css-modules
                            modules: {
                                localIdentName: isDebug ? '[local]' : '[hash:base64:7]',
                            },
                        },
                    },

                    // Apply PostCSS plugins including autoprefixer
                    {
                        loader: 'postcss-loader',
                        options: { postcssOptions: postcssConfig },
                    },

                    // Compile Sass to CSS (Dart Sass)
                    {
                        test: /\.(scss|sass)$/,
                        loader: 'sass-loader',
                        options: {
                            api: 'modern',
                            sassOptions: {
                                quietDeps: true,
                                // The legacy SCSS still uses @import and global color functions
                                silenceDeprecations: [
                                    'import',
                                    'global-builtin',
                                    'color-functions',
                                    'slash-div',
                                    'if-function',
                                    'abs-percent',
                                    'function-units',
                                ],
                            },
                        },
                    },
                ],
            },

            // Rules for images
            {
                test: reImage,
                oneOf: [
                    // Inline lightweight images referenced from styles
                    {
                        issuer: reStyle,
                        type: 'asset',
                        parser: { dataUrlCondition: { maxSize: 4096 } },
                    },
                    // Or return public URL to image resource
                    {
                        type: 'asset/resource',
                    },
                ],
            },

            // Convert plain text into JS module
            {
                test: /\.txt$/,
                type: 'asset/source',
            },

            // Return public URL for all other assets (fonts, cursors, ...)
            // DO NOT FORGET to update `exclude` list when you adding a new loader
            {
                exclude: [reScript, reStyle, reImage, reGraphql, /\.json$/, /\.txt$/, /\.md$/],
                type: 'asset/resource',
            },
        ],
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: isDebug
            ? {}
            : {
                  // dev-only helper used for hot reload in src/client.tsx
                  'react-deep-force-update': false,
              },
    },

    // Don't attempt to continue if there are any errors.
    bail: !isDebug,

    cache: isDebug ? { type: 'memory' } : false,

    // Specify what bundle information gets displayed
    // https://webpack.js.org/configuration/stats/
    stats: {
        cached: isVerbose,
        cachedAssets: isVerbose,
        chunks: isVerbose,
        chunkModules: isVerbose,
        colors: true,
        hash: isVerbose,
        modules: isVerbose,
        reasons: isDebug,
        timings: true,
        version: isVerbose,
        assets: isVerbose,
    },

    // Choose a developer tool to enhance debugging
    // https://webpack.js.org/configuration/devtool/#devtool
    devtool: isDebug ? 'inline-cheap-module-source-map' : 'source-map',
};

//
// Configuration for the client-side bundle (client.js)
// -----------------------------------------------------------------------------

const clientConfig: webpack.Configuration = {
    ...config,

    name: 'client',
    target: 'web',

    entry: {
        client: ['./src/client'],
        polyfills: ['./src/polyfills'],
    },

    plugins: [
        // Define free variables
        // https://webpack.js.org/plugins/define-plugin/
        new webpack.DefinePlugin({
            'process.env.BROWSER': true,
            __DEV__: isDebug,
        }),

        new ChunkManifestPlugin(),

        ...(isAnalyze && !isDebug ? [new BundleAnalyzerPlugin()] : []),
    ],

    // Move modules that occur in multiple entry chunks to a new entry chunk (the commons chunk).
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: 'initial',
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                },
            },
        },
    },

    // Some libraries import Node modules but don't use them in the browser.
    resolve: {
        ...config.resolve,
        fallback: {
            fs: false,
            net: false,
            tls: false,
        },
    },
};

//
// Configuration for the server-side bundle (server.js)
// -----------------------------------------------------------------------------

const serverConfig: webpack.Configuration = {
    ...config,

    name: 'server',
    target: 'node',

    entry: {
        server: ['./src/server'],
    },

    output: {
        ...config.output,
        path: BUILD_DIR,
        filename: '[name].js',
        chunkFilename: 'chunks/[name].js',
        library: { type: 'commonjs2' },
    },

    // Webpack mutates resolve object, so clone it to avoid issues
    // https://github.com/webpack/webpack/issues/4817
    resolve: {
        ...config.resolve,
    },

    module: {
        ...config.module,

        rules: overrideRules(config.module!.rules, (rule: any) => {
            // Override babel-preset-env configuration for Node.js
            if (rule.loader === 'babel-loader') {
                return {
                    ...rule,
                    options: babelOptions({ targets: { node: '24' }, modules: false, useBuiltIns: false }),
                };
            }

            // Static assets are emitted by the client build only
            if (rule.type === 'asset' || rule.type === 'asset/resource') {
                return {
                    ...rule,
                    generator: { ...rule.generator, emit: false },
                };
            }

            return rule;
        }),
    },

    externals: [
        './chunk-manifest.json',
        './asset-manifest.json',
        nodeExternals({
            allowlist: [reStyle, reImage],
        }),
    ],

    plugins: [
        // Define free variables
        // https://webpack.js.org/plugins/define-plugin/
        new webpack.DefinePlugin({
            'process.env.BROWSER': false,
            __DEV__: isDebug,
        }),

        // Adds a banner to the top of each generated chunk
        // https://webpack.js.org/plugins/banner-plugin/
        new webpack.BannerPlugin({
            banner: 'require("source-map-support").install();',
            raw: true,
            entryOnly: false,
        }),
    ],

    // Do not replace node globals with polyfills
    // https://webpack.js.org/configuration/node/
    node: {
        global: false,
        __filename: false,
        __dirname: false,
    },
};

export default [clientConfig, serverConfig];
