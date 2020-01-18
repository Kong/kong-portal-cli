#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clipanion_1 = require("clipanion");
const deploy_1 = require("./commands/deploy");
const wipe_1 = require("./commands/wipe");
const fetch_1 = require("./commands/fetch");
const disable_1 = require("./commands/disable");
const enable_1 = require("./commands/enable");
const serve_1 = require("./commands/serve");
clipanion_1.clipanion
    .command(`deploy <workspace> [-W,--watch] [-P,--preserve]`)
    .describe(`Deploy changes made locally under the given workspace upstream. \n
    [-W, --watch] to make changes reactively \n
    [-P, --preserve] to avoid deleting files upstream that you do not have locally`)
    .action(deploy_1.default);
clipanion_1.clipanion
    .command(`fetch <workspace> [-K,--keep-encode]`)
    .describe(`Fetches content and themes from the given workspace. \n
    [-k, --keep-encode] to store binary assets locally as base64 encoded string`)
    .action(fetch_1.default);
clipanion_1.clipanion
    .command(`wipe <workspace>`)
    .describe(`Deletes all content and themes from upstream workspace.`)
    .action(wipe_1.default);
clipanion_1.clipanion
    .command(`config <workspace>`)
    .describe(`Output or change configuration of the portal on the given workspace, locally.`)
    .action(require('./commands/config'));
clipanion_1.clipanion
    .command(`enable <workspace>`)
    .describe(`Enable the portal on the given workspace.`)
    .action(enable_1.default);
clipanion_1.clipanion
    .command(`disable <workspace>`)
    .describe(`Disable the portal on the given workspace.`)
    .action(disable_1.default);
clipanion_1.clipanion
    .command(`serve <workspace>`)
    .describe(`Run the portal of a given workspace locally.`)
    .action(serve_1.default);
clipanion_1.clipanion.runExit('portal', process.argv.slice(2));
