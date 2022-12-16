import { buildCli, runTask } from './build.mjs'
;(async () => {
  await Promise.all([runTask('shovel-cli', buildCli)])
})()
