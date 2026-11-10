/**
 * The auth broker runs via babel-node (not webpack), so set the `__DEV__` global that config reads
 * before any config import. This file must be imported first in server.ts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__DEV__ = process.env.NODE_ENV !== 'production';

export {};
