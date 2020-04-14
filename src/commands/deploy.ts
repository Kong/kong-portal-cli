import * as chokidar from 'chokidar'
import * as ora from 'ora'

import Workspace from '../core/Workspace'
import RestClient from '../core/HTTP/RestClient'

import wipe from './wipe'

import { MissingWorkspaceError } from '../helpers'

async function Deploy(workspace: Workspace, path?: any): Promise<void> {
  let client: RestClient

  try {
    client = new RestClient(workspace.config, workspace.name)

    console.log(`Deploying ${workspace.name}:`)
    console.log(``)

    let spinner = ora({
      prefixText: `Deploying ${path || 'file'}...`,
      text: `reading files...`,
    }).start()

    await workspace.scan()
    for (let file of workspace.files) {
      if (path && file.location.split(path)[1] !== '') {
        continue
      }

      spinner.text = file.location
      await file.read()
      await client.saveFile(file.resource)
    }

    spinner.prefixText = `\t`
    if (!path) {
      spinner.text = `Deployed all Files to ${workspace.name}`
    }
    spinner.succeed()

    console.log(``)
  } catch (e) {
    console.log(e.url, e.message)
  }
}

export default async (args: any): Promise<void> => {
  if (!args.preserve) {
    await wipe(args)
  }

  let workspace: Workspace

  try {
    workspace = await Workspace.init(args.workspace)
  } catch (e) {
    return MissingWorkspaceError(args.workspace)
  }

  await Deploy(workspace)

  if (args.watch) {
    console.log(`Watching`, `${workspace.path}/*`)
    console.log(``)

    let watcher: any = chokidar.watch('.', {
      cwd: workspace.path,
      alwaysStat: true,
    })

    watcher.on('change', (path, stats): void => {
      if (stats && stats.isFile()) {
        Deploy(workspace, path)
      }
    })
  }
}
