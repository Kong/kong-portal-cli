import * as ora from 'ora'

import Workspace from '../core/Workspace'
import RestClient from '../core/HTTP/RestClient'
import FileResource from '../core/HTTP/Resources/FileResource'
import { MissingWorkspaceError } from '../helpers'

export default async (args): Promise<void> => {
  let workspace: Workspace
  let client: RestClient

  try {
    workspace = await Workspace.init(args.workspace, args.disableSSLVerification, args.ignoreSpecs)
  } catch (e) {
    return MissingWorkspaceError(args.workspace)
  }

  client = new RestClient(workspace.config, workspace.name)

  let spinner = ora({
    prefixText: `Wiping...`,
    text: `reading files...`,
  }).start()

  let files: FileResource[]
  try {
    files = await client.getAllFiles()

    for (let file of files) {
      if (workspace.config.ignoreSpecs && file.path.startsWith('specs')) {
        continue
      }
      spinner.text = file.path
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
