import { join as pathJoin } from 'path';
import { generate } from '@graphql-codegen/cli';
import { print } from 'graphql';

import runWebpack from './lib/runWebpack';
import webpackConfig from './webpack.config';

const [, serverConfig] = webpackConfig;

/**
 * Generates TypeScript types and Apollo hooks (src/__generated__/graphql.tsx) from the
 * GraphQL schema (compiled from src/data/schema) and the documents in src/**.
 * The output file is overwritten in place, not deleted first: a running dev server
 * watches it and would fail on a missing module.
 */
export default async function codegen() {
    await runWebpack(
        [
            {
                ...serverConfig,
                entry: './src/data/schema',
                output: {
                    path: serverConfig.output!.path,
                    filename: 'schema.js',
                    library: { type: 'commonjs2' },
                },
            },
        ],
        serverConfig.stats!,
    );

    // eslint-disable-next-line global-require, import/no-dynamic-require, import/no-unresolved
    const builtSchema = require('../build/schema').default;

    const genTargetDir = pathJoin(process.cwd(), 'src/__generated__/graphql.tsx');

    await generate(
        {
            schema: print(builtSchema),
            documents: ['./src/**/*.{graphql,ts,tsx}', '!./src/__generated__/**'],
            config: {
                scalars: {
                    URL: 'string',
                    DateTime: 'string',
                    HexColorCode: 'string',
                },
                withHooks: false,
            },
            generates: {
                [genTargetDir]: {
                    plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
                },
            },
        },
        true,
    );
}
