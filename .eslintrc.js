// ESLint configuration
// http://eslint.org/docs/user-guide/configuring
module.exports = {
    parser: '@typescript-eslint/parser',

    extends: ['airbnb', 'plugin:react-hooks/recommended', 'plugin:css-modules/recommended', 'prettier', 'prettier/react'],

    plugins: ['@typescript-eslint/eslint-plugin', 'react-hooks', 'css-modules', 'prettier', 'jest'],

    parserOptions: {
        sourceType: 'module',
        project: './tsconfig.json',
    },

    globals: {
        __DEV__: true,
    },

    env: {
        browser: true,
        jest: true,
    },

    rules: {
        // Forbid the use of extraneous packages
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md
        'import/no-extraneous-dependencies': ['error', { packageDir: '.' }],

        // Fix strange bug with extensions
        'import/extensions': 'off',

        // https://eslint.org/docs/rules/lines-between-class-members
        'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],

        // Order of imports
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md
        'import/order': [
            'error',
            {
                groups: [['builtin', 'external'], 'internal', ['index', 'sibling', 'parent']],
                'newlines-between': 'always',
            },
        ],

        'no-plusplus': 'off',

        // Recommend not to leave any console.log in your code
        // Use console.error, console.warn and console.info instead
        // https://eslint.org/docs/rules/no-console
        'no-console': [
            'error',
            {
                allow: ['warn', 'error', 'info'],
            },
        ],

        // Allow only special identifiers
        // https://eslint.org/docs/rules/no-underscore-dangle
        'no-underscore-dangle': [
            'error',
            {
                allow: ['__typename', '__DEV__'],
            },
        ],

        // Prefer destructuring from arrays and objects
        // http://eslint.org/docs/rules/prefer-destructuring
        'prefer-destructuring': [
            'error',
            {
                VariableDeclarator: {
                    array: false,
                    object: true,
                },
                AssignmentExpression: {
                    array: false,
                    object: false,
                },
            },
            {
                enforceForRenamedProperties: false,
            },
        ],

        // Ensure <a> tags are valid
        // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/anchor-is-valid.md
        'jsx-a11y/anchor-is-valid': [
            'error',
            {
                components: ['Link'],
                specialLink: ['to'],
                aspects: ['noHref', 'invalidHref', 'preferButton'],
            },
        ],

        // Allow .js files to use JSX syntax
        // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md
        'react/jsx-filename-extension': [1, { extensions: ['.ts', '.tsx'] }],

        // Functional and class components are equivalent from React’s point of view
        // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prefer-stateless-function.md
        'react/prefer-stateless-function': 'off',

        // ESLint plugin for prettier formatting
        // https://github.com/prettier/eslint-plugin-prettier
        'prettier/prettier': 'error',

        'react/forbid-prop-types': 'off',
        'react/destructuring-assignment': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/static-property-placement': 'off',
        'react/state-in-constructor': 'off',

        // TypeScript checks prop-types
        'react/prop-types': 'off',

        // Cannot config .ts, .tsx resolution
        'import/no-unresolved': 'off',

        'import/no-webpack-loader-syntax': 'off',

        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                vars: 'local',
                args: 'after-used',
                ignoreRestSiblings: false,
                argsIgnorePattern: '^_',
            },
        ],

        '@typescript-eslint/no-explicit-any': 'error',

        // https://openbase.io/js/eslint-plugin-css-modules
        'css-modules/no-unused-class': 'off',

        // Type variables by Codegen can not be camelcase.
        camelcase: 'off',
    },
};
