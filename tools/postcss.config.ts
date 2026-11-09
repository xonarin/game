/* eslint-disable global-require */

const isDebug = !process.argv.includes('--release');

// PostCSS plugins for project and third-party styles (used as postcss-loader `postcssOptions`)
const config = {
    plugins: [
        // Inline @import rules, e.g. @import 'normalize.css'
        require('postcss-import')(),
        // Flexbox bug fixes
        require('postcss-flexbugs-fixes')(),
        // Modern CSS features + vendor prefixes for the "browserslist" targets in package.json
        require('postcss-preset-env')({
            stage: 3,
            autoprefixer: { flexbox: 'no-2009' },
        }),
        // Minify in production builds
        ...(isDebug ? [] : [require('cssnano')({ preset: ['default', { discardComments: { removeAll: true } }] })]),
    ],
};

export default config;
