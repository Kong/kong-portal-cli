import RestClient from '../core/HTTP/RestClient'
import Workspace from '../core/Workspace'
import * as ora from 'ora'

import { MissingWorkspaceError } from '../helpers'

export default async (args): Promise<void> => {
  let workspace: Workspace
  let client: RestClient

  try {
    workspace = await Workspace.init(args.workspace, args.disableSSLVerification)
  } catch (e) {
    return MissingWorkspaceError(args.workspace)
  }

  let spinner: ora.Ora = ora({
    prefixText: `Enabling ${workspace.name} Portal...`,
  })

  spinner.start()

  try {
    client = new RestClient(workspace.config, workspace.name)
    await client.enablePortal()

    spinner.prefixText = `\t`
    spinner.text = `'${workspace.name}' Portal Enabled`
    spinner.succeed()
  } catch (e) {
    spinner.fail(e.message)
  }
}
