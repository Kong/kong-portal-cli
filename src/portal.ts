#!/usr/bin/env node

import { clipanion } from 'clipanion';

clipanion.topLevel(`[-v,--verbose]`);

clipanion
  .command(`deploy <workspace>`)
  .describe(`Deploy changes made locally under the given workspace upstream.`)
  .action(require('./commands/deploy'));

clipanion
  .command(`fetch <workspace>`)
  .describe(`Fetches content and themes from the given workspace.`)
  .action(require('./commands/fetch'));

clipanion
  .command(`reset <workspace>`)
  .describe(`Resets content and themes in the given workspace, locally.`)
  .action(require('./commands/reset'));

clipanion
  .command(`config <workspace>`)
  .describe(`Output or change configuration of the portal on the given workspace, locally.`)
  .action(require('./commands/config'));

clipanion
  .command(`enable <workspace>`)
  .describe(`Enable the portal on the given workspace.`)
  .action(require('./commands/enable'));

clipanion
  .command(`disable <workspace>`)
  .describe(`Enable the portal on the given workspace.`)
  .action(require('./commands/disable'));

clipanion
  .command(`serve <workspace>`)
  .describe(`Run the portal of a given workspace locally.`)
  .action(require('./commands/serve'));

clipanion.runExit('portal', process.argv.slice(2));
