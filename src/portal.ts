#!/usr/bin/env node

import { clipanion } from 'clipanion';

clipanion.topLevel(`[-v,--verbose]`);

import DeployCommand from './commands/deploy';
import WipeCommand from './commands/wipe';

clipanion
  .command(`deploy <workspace>`)
  .describe(`Deploy changes made locally under the given workspace upstream.`)
  .action(DeployCommand);

clipanion
  .command(`fetch <workspace>`)
  .describe(`Fetches content and themes from the given workspace.`)
  .action(require('./commands/fetch'));

clipanion
  .command(`wipe <workspace>`)
  .describe(`Deletes all content and themes from upstream workspace.`)
  .action(WipeCommand);

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
