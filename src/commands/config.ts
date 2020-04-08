import Workspace from '../core/Workspace'
import Config from '../core/Config'

import { UsageError } from 'clipanion'

function MissingWorkspaceError(name: string) void {
  const message: string[] = [
    `No workspace named "${name}" was found.`,
    '',
    'Directories scanned:',
    `\t${Workspace.getDirectoryPath(name)}`,
  ]

  throw new UsageError(message.join('\n'))
}

function MissingWorkspaceThemeError(workspace: Workspace) {
  const message: string[] = [
    `Unable to find theme "${workspace.getCurrentThemeName()}" in workspace "${workspace.name}".`,
  ]

  throw new UsageError(message.join('\n'))
}

function ConfigToConsole(name: string, config: Config) {
  console.log('')
  console.log(`${name}:`)
  config.toConsole()
}

module.exports = async (args) => {
  const workspaceExists = await Workspace.exists(args.workspace)
  if (!workspaceExists) MissingWorkspaceError(args.workspace)

  const workspace = await Workspace.init(args.workspace)
  ConfigToConsole('CLI Config', workspace.config)
  ConfigToConsole('Portal Config', workspace.portalConfig)

  try {
    const theme = await workspace.getCurrentTheme()
    ConfigToConsole('Theme Config Options', theme.config)
    theme.outputStatsToConsole()
  } catch (e) {
    MissingWorkspaceThemeError(workspace)
  }
}
