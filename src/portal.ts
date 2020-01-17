#!/usr/bin/env node

import { clipanion } from 'clipanion';

import DeployCommand from './commands/deploy';
import WipeCommand from './commands/wipe';
import FetchCommand from './commands/fetch';
import DisableCommand from './commands/disable';
import EnableCommand from './commands/enable';
import ServeCommand from './commands/serve';


clipanion
  .command(`deploy <workspace> [-W,--watch] [-P,--preserve]`)
  .describe(
    `Deploy changes made locally under the given workspace upstream. \n
    [-W, --watch] to make changes reactively \n
    [-P, --preserve] to avoid deleting files upstream that you do not have locally`
  )
  .action(DeployCommand);

clipanion
  .command(`fetch <workspace>`)
  .describe(`Fetches content and themes from the given workspace.`)
  .action(FetchCommand);

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
  .action(EnableCommand);

clipanion
  .command(`disable <workspace>`)
  .describe(`Disable the portal on the given workspace.`)
  .action(DisableCommand);

clipanion
  .command(`serve <workspace>`)
  .describe(`Run the portal of a given workspace locally.`)
  .action(ServeCommand);

clipanion.runExit('portal', process.argv.slice(2));
