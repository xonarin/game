/**
 * The admin backend runs via babel-node (not webpack), so the `__DEV__` global that webpack's
 * DefinePlugin injects for the main app is not defined here. Set it before any module that reads
 * config (which references `__DEV__`) is imported — this file must be imported first in server.ts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__DEV__ = process.env.NODE_ENV !== 'production';

export {};
