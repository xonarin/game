import { cleanDir } from './lib/fs';

/**
 * Cleans up the output (build) directory.
 */
function clean() {
    return cleanDir('build', ['.git']);
}

export default clean;
