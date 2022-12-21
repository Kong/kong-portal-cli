import ora from 'ora'

import Workspace from '../core/Workspace'
import RestClient from '../core/HTTP/RestClient'
import FileResource from '../core/HTTP/Resources/FileResource'
import { MissingWorkspaceError } from '../helpers'

export default async (args): Promise<void> => {
  let workspace: Workspace

  try {
    workspace = await Workspace.init(args.workspace, args.disableSSLVerification, args.ignoreSpecs, args.skipPath)
  } catch (e) {
    return MissingWorkspaceError(args.workspace)
  }

  const client = new RestClient(workspace.config, workspace.name)

  const spinner = ora({
    prefixText: `Wiping...`,
    text: `reading files...`,
  }).start()

  let files: FileResource[]
  try {
    files = await client.getAllFiles({ fields: 'path' })

    if (workspace.config.skipPaths && workspace.config.skipPaths.length > 0) {
      files = files.filter(
        (file: FileResource): boolean => !workspace.config.skipPaths.some((path) => file.path?.startsWith(path)),
      )
    }

    for (const file of files) {
      if (workspace.config.ignoreSpecs && file.path?.startsWith('specs')) {
        continue
      }
      spinner.text = file.path || file.id || 'file'
      await client.deleteFile(file)
    }
  } catch (e) {
    spinner.text = client.handleError(e)
    spinner.fail()
    return
  }

  spinner.prefixText = `\t`
  spinner.text = workspace.config.ignoreSpecs
    ? `Wiped all non-spec Files from ${workspace.name}`
    : `Wiped all Files from ${workspace.name}`
  spinner.succeed()
}
