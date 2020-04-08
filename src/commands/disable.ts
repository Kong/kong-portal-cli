import { UsageError } from 'clipanion'

import RestClient from '../core/HTTP/RestClient'
import WorkspaceRepository from '../core/HTTP/Repositories/WorkspaceRepository'
import Workspace from '../core/Workspace'
import * as ora from 'ora'

function MissingWorkspaceError(name: string): void {
  const message: string[] = [
    `No workspace named "${name}" was found.`,
    '',
    'Directories scanned:',
    `\t${Workspace.getDirectoryPath(name)}`,
  ]

  throw new UsageError(message.join('\n'))
}

export default async (args): Promise<void> => {
  let workspace: Workspace
  let client: RestClient

  try {
    workspace = await Workspace.init(args.workspace)
  } catch (e) {
    return MissingWorkspaceError(args.workspace)
  }

  let spinner: ora.Ora = ora({
    prefixText: `Disabling ${workspace.name} Portal...`,
  })

  spinner.start()

  try {
    client = new RestClient(workspace.config, workspace.name)
    let wsRepository = new WorkspaceRepository(client)
    let ws = await wsRepository.getWorkspace(workspace.name)

    ws.config.portal = false
    await client.save(ws, {
      body: ws.toObject(),
    })

    spinner.prefixText = '\t'
    spinner.text = `'${workspace.name}' Portal Disabled`
    spinner.succeed()
  } catch (e) {
    spinner.fail(e.message)
  }
}
