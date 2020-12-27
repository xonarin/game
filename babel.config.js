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
        '@babel/preset-react',
        '@babel/preset-typescript',
    ],
    plugins: [
        ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-optional-chaining',
    ],
    ignore: ['node_modules', 'build'],
};
