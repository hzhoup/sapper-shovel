import { execa } from 'execa'
import ora from 'ora'
import { resolve } from 'path'

const CWD = process.cwd()
const PACKAGE_CLI = resolve(CWD, './packages/shovel-cli')

export const buildCli = () => execa('pnpm', ['build'], { cwd: PACKAGE_CLI })

export const runTask = async (taskName, task) => {
  const note = ora().start(`Building ${taskName}`)
  try {
    await task()
    note.succeed(`Build ${taskName} Successful`)
  } catch (e) {
    note.fail(`Build ${taskName} Failed`)
    console.error(e.toString())
  }
}
