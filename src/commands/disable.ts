import RestClient from '../core/HTTP/RestClient'
import Workspace from '../core/Workspace'
import ora from 'ora'

import { MissingWorkspaceError } from '../helpers'

export default async (args): Promise<void> => {
  let workspace: Workspace
  let client: RestClient

  try {
    workspace = await Workspace.init(args.workspace, args.disableSSLVerification)
  } catch (e) {
    return MissingWorkspaceError(args.workspace)
  }

  const spinner: ora.Ora = ora({
    prefixText: `Enabling ${workspace.name} Portal...`,
  })

  spinner.start()

  try {
    client = new RestClient(workspace.config, workspace.name)
    await client.disablePortal()

    spinner.prefixText = `\t`
    spinner.text = `'${workspace.name}' Portal Disabled`
    spinner.succeed()
  } catch (e) {
    console.log(e)
    spinner.fail(e.message)
  }
}
