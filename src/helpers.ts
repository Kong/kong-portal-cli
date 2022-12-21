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

export function arrayPartition<T>(arr: T[], callback: (element: T, index: number, array: T[]) => unknown) {
  return arr.reduce(
    (result, element, i) => {
      if (callback(element, i, arr)) {
        result.matched.push(element)
      } else {
        result.mismatched.push(element)
      }

      return result
    },
    { matched: [], mismatched: [] } as { matched: Array<T>; mismatched: Array<T> },
  )
}
