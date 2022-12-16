import fse from 'fs-extra';
import { fileURLToPath } from 'url';
const { pathExistsSync, lstatSync } = fse;
export const getDirname = (url) => fileURLToPath(new URL('.', url));
export const isDir = (file) => pathExistsSync(file) && lstatSync(file).isDirectory();
