import { execa } from 'execa'
import ora from 'ora'
import { resolve } from 'path'
import { CWD, ESLINT_EXTENSIONS, PRETTIER_EXTENSIONS } from '../shared/constant.js'
import { isDir } from '../shared/fseUtils.js'

export const lint = async () => {
  let spinner = ora()
  try {
    spinner = ora('Prettier Starting...').start()
    await execa('prettier', ['--write', '--cache', `./**/*.{${PRETTIER_EXTENSIONS.join(',')}}`])
    spinner.succeed('Prettier Successful')

    spinner = ora('Eslint Starting...').start()
    const packages: string[] = ['./packages/shovel-cli/src']
    const { stdout } = await execa('eslint', [
      ...packages.filter(p => isDir(resolve(CWD, p))),
      '--fix',
      '--cache',
      '--ext',
      ESLINT_EXTENSIONS.join()
    ])
    const type = stdout ? 'warn' : 'succeed'
    spinner[type](stdout || 'Eslint Successful')
  } catch (error: unknown) {
    spinner?.fail((error as object).toString())
    process.exit(1)
  }
}
