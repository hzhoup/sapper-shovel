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
program
    .command('changelog')
    .option('-rc --releaseCount <releaseCount>', 'Release count')
    .option('-f --file <file>', 'Changelog filename')
    .description('Generate changelog')
    .action(async (option) => {
    const { changelog } = await import('./commands/changelog.js');
    return changelog(option);
});
program
    .command('publish')
    .option('-r --remote <remote>', 'Remote name')
    .description('Publish all packages')
    .action(async (option) => {
    const { publish } = await import('./commands/publish.js');
    return publish(option);
});
program.on('command:*', async ([cmd]) => {
    const { default: logger } = await import('./shared/logger.js');
    program.outputHelp();
    logger.error(`\nUnknown Command ${cmd}.\n`);
    process.exit(1);
});
program.parse();
