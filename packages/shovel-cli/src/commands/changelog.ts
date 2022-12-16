import conventionalChangelog from 'conventional-changelog'
import fse from 'fs-extra'
import ora from 'ora'
import { resolve as resolvePath } from 'path'
import { CWD } from '../shared/constant.js'

const { createWriteStream } = fse

interface ChangelogOptions {
  file?: string
  releaseCount?: number
}

export const changelog = async ({
  file = 'CHANGELOG.md',
  releaseCount = 0,
}: ChangelogOptions = {}): Promise<void> => {
  console.log(1)
  const note = ora().start(`Generating changelog`)
  return new Promise(resolve => {
    conventionalChangelog({
      preset: 'angular',
      releaseCount,
    })
      .pipe(createWriteStream(resolvePath(CWD, file)))
      .on('close', () => {
        note.succeed(`Changelog generated success`)
        resolve()
      })
  })
}
