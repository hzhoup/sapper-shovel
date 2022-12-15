import fse from 'fs-extra'
import { fileURLToPath } from 'url'

const { pathExistsSync, lstatSync } = fse

export const getDirname = (url: string): string => fileURLToPath(new URL('.', url))

export const isDir = (file: string): boolean =>
  pathExistsSync(file) && lstatSync(file).isDirectory()
