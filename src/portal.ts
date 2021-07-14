#!/usr/bin/env node

import { Cli, Command } from 'clipanion'

import Init from './commands/init'
import Deploy from './commands/deploy'
import Wipe from './commands/wipe'
import Fetch from './commands/fetch'
import Disable from './commands/disable'
import Enable from './commands/enable'
import Config from './commands/config'

import * as packageJson from '../package.json'

const cli = new Cli({
  binaryLabel: `Kong Portal CLI Tool`,
  binaryName: `portal`,
  binaryVersion: packageJson.version,
})

class InitCommand extends Command {
  public static usage = Command.Usage({
    description: 'Initialize a local workspace with a default \`cli.conf.yaml\` configuration file.',
    details: `
    This command will initialize a local workspace with a default \`cli.conf.yaml\` configuration file. \n
    `,
  })

  @Command.String({ required: true })
  public workspace!: string

  @Command.Path(`init`)
  public async execute(): Promise<void> {
    await Init(this)
  }
}

class DeployCommand extends Command {
  public static usage = Command.Usage({
    description: 'Deploy changes made locally under the given workspace upstream.',
    details: `
    This command will deploy local templates upstream from given workspace folder to the same workspace upstream.\n
    If \`-P,--preserve\` option is given a wipe operation will NOT be run first. This will persist the files upstream not found locally.\n
    If \`-W,--watch\` option is given after all the local templates are deployed the deploy will stay running and push any new changes on the filesystem in the workspace.\n
    If \`-D,--disable-ssl-verification\` option is given or \`disable_ssl_verification: true\` is set in \`cli.conf.yaml\`, SSL verification will be disabled to allow for use of self-signed certs.\n
    If \`-I,--ignore-specs\` option is given or \`ignore_specs: true\` in is set in \`cli.conf.yaml\`, the '\\specs' folder will be ignored.`,
  })

  @Command.String({ required: true })
  public workspace!: string

  @Command.Boolean(`-P,--preserve`)
  public preserve: boolean = false

  @Command.Boolean(`-W,--watch`)
  public watch: boolean = false

  @Command.Boolean(`-D,--disable-ssl-verification`)
  public disableSSLVerification: boolean = false

  @Command.Boolean(`-I,--ignore-specs`)
  public ignoreSpecs: boolean = false

  @Command.Path(`deploy`)
  public async execute(): Promise<void> {
    await Deploy(this)
  }
}

class FetchCommand extends Command {
  public static usage = Command.Usage({
    description: 'Fetches content and themes from the given workspace.',
    details: `
    This command will fetch local templates upstream from given workspace upstream to the workspace folder locally.\n
    The workspace folder must already exist locally with a \`cli.conf.yaml\`.\n
    If \`-K,--keep-encode\` option is given, base64 assets will remain as base64 strings instead of converting to binary files.\n
    If \`-D,--disable-ssl-verification\` option is given or \`disable_ssl_verification: true\` is set in \`cli.conf.yaml\`, SSL verification will be disabled to allow for use of self-signed certs.\n
    If \`-I,--ignore-specs\` option is given or \`ignore_specs: true\` is set in \`cli.conf.yaml\`, the '\\specs' folder will be ignored.`,
  })

  @Command.String({ required: true })
  public workspace!: string

  @Command.Boolean(`-K,--keep-encode`)
  public keepEncode: boolean = false

  @Command.Boolean(`-D,--disable-ssl-verification`)
  public disableSSLVerification: boolean = false

  @Command.Boolean(`-I,--ignore-specs`)
  public ignoreSpecs: boolean = false

  @Command.Path(`fetch`)
  public async execute(): Promise<void> {
    await Fetch(this)
  }
}

class WipeCommand extends Command {
  public static usage = Command.Usage({
    description: 'Deletes all content and themes from upstream workspace.',
    details: `
    This command will delete all content and themes from the Upstream Workspace.\n
    If \`-D,--disable-ssl-verification\` option is given or \`disable_ssl_verification: true\` is set in \`cli.conf.yaml\`, SSL verification will be disabled to allow for use of self-signed certs.\n
    If \`-I,--ignore-specs\` option is given or \`ignore_specs: true\` is set in \`cli.conf.yaml\`, the '\\specs' folder will be ignored.`,
  })

  @Command.String({ required: true })
  public workspace!: string

  @Command.Boolean(`-D,--disable-ssl-verification`)
  public disableSSLVerification: boolean = false
  @Command.Boolean(`-I,--ignore-specs`)
  public ignoreSpecs: boolean = false

  @Command.Path(`wipe`)
  public async execute(): Promise<void> {
    await Wipe(this)
  }
}

class ConfigCommand extends Command {
  public static usage = Command.Usage({
    description: 'Output configuration of the portal on the given workspace, locally.',
  })

  @Command.String({ required: true })
  public workspace!: string

  @Command.Path(`config`)
  public async execute(): Promise<void> {
    await Config(this)
  }
}

class EnableCommand extends Command {
  public static usage = Command.Usage({
    description: 'Enable the portal on the given workspace.',
    details: `
    This command turns on the portal on a existing workspace. Note: \`portal: on\` must be set in the kong.conf.\n
    If \`-D,--disable-ssl-verification\` option is given or \`disable_ssl_verification: true\` is set in \`cli.conf.yaml\`, SSL verification will be disabled to allow for use of self-signed certs.`,
  })

  @Command.String({ required: true })
  public workspace!: string

  @Command.Boolean(`-D,--disable-ssl-verification`)
  public disableSSLVerification: boolean = false

  @Command.Path(`enable`)
  public async execute(): Promise<void> {
    await Enable(this)
  }
}

class DisableCommand extends Command {
  public static usage = Command.Usage({
    description: 'Disable the portal on the given workspace.',
    details: `
    This command turns off the portal on the given workspace.\n
    If \`-D,--disable-ssl-verification\` option is given or \`disable_ssl_verification: true\` is set in \`cli.conf.yaml\`, SSL verification will be disabled to allow for use of self-signed certs.`,
  })

  @Command.String({ required: true })
  public workspace!: string

  @Command.Boolean(`-D,--disable-ssl-verification`)
  public disableSSLVerification: boolean = false

  @Command.Path(`disable`)
  public async execute(): Promise<void> {
    await Disable(this)
  }
}

class VersionCommand extends Command {
  public static usage = Command.Usage({
    description: 'Display version',
  })

  @Command.Path(`--version`)
  @Command.Path(`-v`)
  @Command.Path(`-V`)
  public async execute(): Promise<void> {
    this.context.stdout.write(`${cli.binaryLabel}, version ${cli.binaryVersion}\n`)
  }
}

class HelpCommand extends Command {
  public static usage = Command.Usage({
    description: 'Display help text',
  })

  @Command.Path(`--help`)
  @Command.Path(`-h`)
  @Command.Path(`-H`)
  public async execute(): Promise<void> {
    this.context.stdout.write(this.cli.usage(null))
  }
}

cli.register(InitCommand)
cli.register(DisableCommand)
cli.register(EnableCommand)
cli.register(ConfigCommand)
cli.register(WipeCommand)
cli.register(FetchCommand)
cli.register(DeployCommand)
cli.register(VersionCommand)

cli.register(HelpCommand)

cli.runExit(process.argv.slice(2), {
  ...Cli.defaultContext,
})
