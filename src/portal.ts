#!/usr/bin/env node

import { clipanion } from 'clipanion'

import DeployCommand from './commands/deploy'
import WipeCommand from './commands/wipe'
import FetchCommand from './commands/fetch'
import DisableCommand from './commands/disable'
import EnableCommand from './commands/enable'

clipanion
  .command('deploy <workspace> [-W,--watch] [-P,--preserve]')
  .describe(
    `Deploy changes made locally under the given workspace upstream. \n
    [-W, --watch] to make changes reactively \n
    [-P, --preserve] to avoid deleting files upstream that you do not have locally`,
  )
  .action(DeployCommand)

clipanion
  .command('fetch <workspace> [-K,--keep-encode]')
  .describe(
    `Fetches content and themes from the given workspace. \n
    [-k, --keep-encode] to store binary assets locally as base64 encoded string`,
  )
  .action(FetchCommand)

clipanion
  .command('wipe <workspace>')
  .describe('Deletes all content and themes from upstream workspace.')
  .action(WipeCommand)

clipanion
  .command('config <workspace>')
  .describe('Output or change configuration of the portal on the given workspace, locally.')
  .action(require('./commands/config'))

clipanion
  .command('enable <workspace>')
  .describe('Enable the portal on the given workspace.')
  .action(EnableCommand)

clipanion
  .command('disable <workspace>')
  .describe('Disable the portal on the given workspace.')
  .action(DisableCommand)

clipanion.runExit('portal', process.argv.slice(2))
