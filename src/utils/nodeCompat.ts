/**
 * Compatibility shims for unmaintained dependencies on modern Node.js.
 * Import this module first in the server entry (src/server.tsx).
 */
import util from 'util';

// graphql-shield@7 (last release 2022) calls util.isUndefined() inside rule chains
// (`chain(...)`, `and(...)`). The deprecated util.is* helpers were removed in Node 23.
// TODO: replace graphql-shield with a maintained permission layer and drop this shim.
const legacyUtil = util as typeof util & { isUndefined?: (value: unknown) => boolean };
if (typeof legacyUtil.isUndefined !== 'function') {
    legacyUtil.isUndefined = (value: unknown) => value === undefined;
}
