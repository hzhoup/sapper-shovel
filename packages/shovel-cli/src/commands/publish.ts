import { execa } from 'execa'
import fse from 'fs-extra'
import glob from 'glob'
import inquirer from 'inquirer'
import ora from 'ora'
import { resolve } from 'path'
import type { ReleaseType } from 'semver'
import semVer from 'semver'
import { CWD } from '../shared/constant.js'
import logger from '../shared/logger.js'
import { changelog } from './changelog.js'

const { readJSONSync, writeFileSync } = fse
const { prompt } = inquirer

const releaseTypes = ['premajor', 'preminor', 'prepatch', 'major', 'minor', 'patch']

const isWorkTreeEmpty = async () => {
  const { stdout } = await execa('git', ['status', '--porcelain'])
  return !stdout
}

const confirmRefs = async (remote = 'origin') => {
  const { stdout } = await execa('git', ['remote', '-v'])
  const reg = new RegExp(`${remote}\t(.*) \\(push`)
  const repo = stdout.match(reg)?.[1]
  const { stdout: branch } = await execa('git', ['branch', '--show-current'])

  const name = 'Refs confirm'
  const ret = await prompt([
    {
      name,
      type: 'confirm',
      message: `Current Refs ${repo}:refs/for/${branch}`,
    },
  ])

  return ret[name]
}

const confirmRegistry = async () => {
  const { stdout } = await execa('npm', ['config', 'get', 'registry'])
  const name = 'Registry confirm'
  const ret = await prompt([{ name, type: 'confirm', message: `Current registry is: ${stdout}` }])
  return ret[name]
}

const getReleaseType = async (): Promise<ReleaseType> => {
  const name = 'please select release type'
  const ret = await prompt([{ name, type: 'list', choices: releaseTypes }])
  return ret[name]
}

const confirmVersion = async (cur: string, exp: string) => {
  const name = 'Version confirm'
  const ret = await prompt([
    { name, type: 'confirm', message: `All packages version ${cur} -> ${exp}` },
  ])
  return ret[name]
}

const updateVersion = (version: string) => {
  const packageFilePaths = glob.sync('packages/*/package.json')
  packageFilePaths.push('package.json')
  packageFilePaths.forEach((path: string) => {
    const file = resolve(CWD, path)
    const config = readJSONSync(file)

    config.version = version
    writeFileSync(file, JSON.stringify(config, null, 2))
  })
}

const publishPnpm = async (preRelease: boolean) => {
  const note = ora().start('Publishing all packages')
  const args = ['-r', 'publish', '--no-git-checks', '--access', 'public']

  preRelease && args.push('--tag', 'alpha')
  const ret = await execa('pnpm', args)
  if (ret.stderr && ret.stderr.includes('npm ERR!')) {
    throw new Error('\n' + ret.stderr)
  } else {
    note.succeed('Publish all packages successfully')
    ret.stdout && logger.info(ret.stdout)
  }
}

const pushGit = async (version: string, remote = 'origin') => {
  const note = ora().start('Pushing to remote git repository')
  await execa('git', ['add', '.'])
  await execa('git', ['commit', '-m', `v${version}`])
  await execa('git', ['tag', `v${version}`])
  await execa('git', ['push', remote, `v${version}`])
  const ret = await execa('git', ['push'])
  note.succeed('Push remote repository successfully')
  ret.stdout && logger.info(ret.stdout)
}

interface PublishOptions {
  remote?: string
}

export const publish = async (options: PublishOptions) => {
  try {
    const curVer = readJSONSync(resolve(CWD, 'package.json')).version

    if (!curVer) {
      logger.error('Sapper Shovel Package is Missing the Version Field.')
      return
    }
    /**
     * 检查 git 工作空间 是否为空
     */
    if (!(await isWorkTreeEmpty())) {
      logger.error('Git WorkTree')
    }

    if (!(await confirmRefs(options.remote))) {
      return
    }
    /**
     * 是否注册 npm
     */
    if (!(await confirmRegistry())) {
      return
    }
    /**
     * 更新版本
     */
    const type = await getReleaseType()
    const isPreRelease = type.startsWith('pre')
    let expVer = semVer.inc(curVer, type, `alpha.${Date.now()}`) as string
    expVer = isPreRelease ? expVer?.slice(0, -2) : expVer
    if (!(await confirmVersion(curVer, expVer))) {
      return
    }

    updateVersion(expVer)
    await publishPnpm(isPreRelease)

    if (!isPreRelease) {
      await changelog()
      await pushGit(expVer, options.remote)
    }

    logger.success(`Release version ${expVer} successfully`)

    if (isPreRelease) {
      try {
        await execa('git', ['restore', '**/package.json'])
        await execa('git', ['restore', 'package.json'])
      } catch {
        logger.error('Restore package.json has failed, please restore manually')
      }
    }
  } catch (e: unknown) {
    logger.error((e as object).toString())
    process.exit(1)
  }
}
