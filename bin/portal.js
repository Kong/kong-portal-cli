#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clipanion_1 = require("clipanion");
clipanion_1.clipanion.topLevel(`[-v,--verbose]`);
clipanion_1.clipanion
    .command(`deploy <workspace>`)
    .describe(`Deploy changes made locally under the given workspace upstream.`)
    .action(require('./commands/deploy'));
clipanion_1.clipanion
    .command(`fetch <workspace>`)
    .describe(`Fetches content and themes from the given workspace.`)
    .action(require('./commands/fetch'));
clipanion_1.clipanion
    .command(`reset <workspace>`)
    .describe(`Resets content and themes in the given workspace, locally.`)
    .action(require('./commands/reset'));
clipanion_1.clipanion
    .command(`config <workspace>`)
    .describe(`Output or change configuration of the portal on the given workspace, locally.`)
    .action(require('./commands/config'));
clipanion_1.clipanion
    .command(`enable <workspace>`)
    .describe(`Enable the portal on the given workspace.`)
    .action(require('./commands/enable'));
clipanion_1.clipanion
    .command(`disable <workspace>`)
    .describe(`Enable the portal on the given workspace.`)
    .action(require('./commands/disable'));
clipanion_1.clipanion
    .command(`serve <workspace>`)
    .describe(`Run the portal of a given workspace locally.`)
    .action(require('./commands/serve'));
clipanion_1.clipanion.runExit('portal', process.argv.slice(2));
