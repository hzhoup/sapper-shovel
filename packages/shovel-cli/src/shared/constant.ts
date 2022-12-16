import { resolve } from 'path'
import { getDirname } from './fseUtils.js'

export const dirname = getDirname(import.meta.url)

export const CWD = process.cwd()

export const PRETTIER_EXTENSIONS = ['vue', 'ts', 'js', 'mjs', 'tsx', 'jsx', 'json', 'md']
export const ESLINT_EXTENSIONS = ['.vue', '.ts', '.js', '.mjs', '.tsx', '.jsx']
export const CLI_PACKAGE_JSON = resolve(dirname, '../../../package.json')
