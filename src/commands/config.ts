import { UsageError } from 'clipanion'

import Workspace from '../core/Workspace'
import Config from '../core/Config'
import { MissingWorkspaceError } from '../helpers'

function MissingWorkspaceThemeError(workspace: Workspace): void {
  const message: string[] = [
    `Unable to find theme "${workspace.getCurrentThemeName()}" in workspace "${workspace.name}".`,
  ]

  throw new UsageError(message.join('\n'))
}

function ConfigToConsole(name: string, config: Config): void {
  console.log(``)
  console.log(`${name}:`)
  config.toConsole()
}

export default async (args): Promise<void> => {
  const workspaceExists = await Workspace.exists(args.workspace)
  if (!workspaceExists) {
    MissingWorkspaceError(args.workspace)
  }
  const workspace = await Workspace.init(args.workspace)
  ConfigToConsole('CLI Config', workspace.config)
  ConfigToConsole('Portal Config', workspace.portalConfig)
  ConfigToConsole('Router Config', workspace.routerConfig)

  try {
    const theme = await workspace.getCurrentTheme()
    ConfigToConsole('Theme Config Options', theme.config)
    theme.outputStatsToConsole()
  } catch (e) {
    MissingWorkspaceThemeError(workspace)
  }
}
