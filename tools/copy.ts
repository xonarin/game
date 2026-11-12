import path from 'path';
import chokidar from 'chokidar';

import { writeFile, copyFile, makeDir, copyDir, removePath } from './lib/fs';
import pkg from '../package.json';
import { format } from './run';

/**
 * Copies static files such as robots.txt, favicon.ico to the
 * output (build) folder.
 */
async function copy() {
    await makeDir('build');
    await Promise.all([
        writeFile(
            'build/package.json',
            JSON.stringify(
                {
                    private: true,
                    engines: pkg.engines,
                    dependencies: pkg.dependencies,
                    scripts: {
                        start: 'node server.js',
                        'migrate:status': 'node migrate.js status',
                        'migrate:rehash': 'node migrate.js rehash',
                    },
                },
                null,
                2,
            ),
        ),
        copyFile('yarn.lock', 'build/yarn.lock'),
        copyDir('public', 'build/public'),
        // SQL-миграции применяются при старте сервера (src/data/migrate.ts)
        copyDir('migrations', 'build/migrations'),
    ]);

    if (process.argv.includes('--watch')) {
        const watcher = chokidar.watch(['public/**/*', 'migrations/**/*'], { ignoreInitial: true });

        watcher.on('all', async (event, filePath) => {
            const start = new Date();
            const src = path.relative('./', filePath);
            const dist = path.join('build/', src.startsWith('src') ? path.relative('src', src) : src);
            switch (event) {
                case 'add':
                case 'change':
                    await makeDir(path.dirname(dist));
                    await copyFile(filePath, dist);
                    break;
                case 'unlink':
                case 'unlinkDir':
                    await removePath(dist);
                    break;
                default:
                    return;
            }
            const end = new Date();
            const time = end.getTime() - start.getTime();
            console.info(`[${format(end)}] ${event} '${dist}' after ${time} ms`);
        });
    }
}

export default copy;
