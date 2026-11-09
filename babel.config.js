// Used by babel-node (tools/*) and Jest. Webpack bundles use the options in tools/webpack.config.ts.
module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current',
                },
            },
        ],
        ['@babel/preset-react', { runtime: 'classic' }],
        '@babel/preset-typescript',
    ],
    ignore: ['node_modules', 'build'],
};
