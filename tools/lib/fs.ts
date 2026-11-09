import { promises as fsp } from 'fs';
import path from 'path';

export const readFile = (file: string): Promise<string> => fsp.readFile(file, 'utf8');

export const writeFile = (file: string, contents: string): Promise<void> => fsp.writeFile(file, contents, 'utf8');

export const renameFile = (source: string, target: string): Promise<void> => fsp.rename(source, target);

export const copyFile = (source: string, target: string): Promise<void> => fsp.copyFile(source, target);

export const makeDir = async (name: string): Promise<void> => {
    await fsp.mkdir(name, { recursive: true });
};

export const copyDir = (source: string, target: string): Promise<void> =>
    fsp.cp(source, target, { recursive: true, force: true });

export const moveDir = async (source: string, target: string): Promise<void> => {
    await copyDir(source, target);
    await fsp.rm(source, { recursive: true, force: true });
};

/** Removes a file or directory (recursively). Missing paths are ignored. */
export const removePath = (target: string): Promise<void> => fsp.rm(target, { recursive: true, force: true });

/** Empties a directory, keeping the entries listed in `keep` (names relative to the directory). */
export const cleanDir = async (dir: string, keep: string[] = []): Promise<void> => {
    let entries: string[];
    try {
        entries = await fsp.readdir(dir);
    } catch {
        return;
    }
    await Promise.all(entries.filter(name => !keep.includes(name)).map(name => removePath(path.join(dir, name))));
};

export default {
    readFile,
    writeFile,
    renameFile,
    copyFile,
    makeDir,
    copyDir,
    moveDir,
    removePath,
    cleanDir,
};
