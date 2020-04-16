import { UsageError } from 'clipanion'
import Workspace from './core/Workspace'

export function MissingWorkspaceError(name: string): void {
  const message: string[] = [
    `No workspace named "${name}" was found.`,
    '',
    'Scanned directories for workspace configurations:',
    `\t${Workspace.getDirectoryPath(name)}`,
  ]

  throw new UsageError(message.join('\n'))
}
