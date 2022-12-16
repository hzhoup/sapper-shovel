#!/usr/bin/env node
import { Command } from 'commander';
import fse from 'fs-extra';
import { CLI_PACKAGE_JSON } from './shared/constant.js';
const { readJSONSync } = fse;
const program = new Command();
program.version(`shovel-cli ${readJSONSync(CLI_PACKAGE_JSON).version}`).usage('<command> [options]');
program
    .command('lint')
    .description('Lint Code')
    .action(async () => {
    const { lint } = await import('./commands/lint.js');
    return lint();
});
program.parse();