import * as chokidar from 'chokidar'
import ora from 'ora'

import Workspace from '../core/Workspace'
import RestClient from '../core/HTTP/RestClient'
import File from '../core/File'

import wipe from './wipe'

import { MissingWorkspaceError } from '../helpers'

async function asyncForEach(array: any[], callback: (arg0: any, arg1: number, arg2: any) => any): Promise<void> {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

function buildFilesObject<T>(fileObj: any, files: File[], filterBy: string): File[] {
  // each time this function runs we create a new property based on filterBy and remove it from files
  // this way we never miss anything from files

  if (filterBy === 'configs') {
    fileObj.configs = files.filter((file): boolean => {
      // eslint-disable-next-line prettier/prettier
      return !(/\//.test(file.resource.path))
    })

    files = files.filter((file: { resource: { path: string } }): boolean => {
      return /\//.test(file.resource.path)
    })
    return files
  }

  fileObj[filterBy] = files.filter((file): boolean => {
    return file.resource.path.startsWith(filterBy)
  })

  files = files.filter((file): boolean => {
    return !file.resource.path.startsWith(filterBy)
  })
  return files
}

async function Deploy(workspace: Workspace, path?: any): Promise<void> {
  let client: RestClient

  console.log(`Deploying ${workspace.name}:`)
  console.log(``)

  let spinner = ora({
    prefixText: `Deploying ${path || 'file'}...`,
    text: `reading files...`,
  }).start()

  client = new RestClient(workspace.config, workspace.name)

  try {
    await workspace.scan()

    const fileObj = {}
    let files: File[] = workspace.files
    files = buildFilesObject(fileObj, files, 'configs')
    files = buildFilesObject(fileObj, files, 'content')
    files = buildFilesObject(fileObj, files, 'specs')
    files = buildFilesObject(fileObj, files, 'emails')
    files = buildFilesObject(fileObj, files, 'themes')

    if (files.length > 0) {
      fileObj['other files'] = files
    }

    await asyncForEach(
      Object.keys(fileObj),
      async (fileType): Promise<void> => {
        if (fileType === 'specs' && workspace.config.ignoreSpecs) {
          return
        }
        let files: File[] = fileObj[fileType]

        if (workspace.config.enablePaths && workspace.config.enablePaths.length > 0) {
          files = fileObj[fileType].filter((file: File): boolean =>
            workspace.config.enablePaths.some((path): boolean => file.resource.path.startsWith(path)),
          )
        }

        if (workspace.config.skipPaths && workspace.config.skipPaths.length > 0) {
          files = fileObj[fileType].filter(
            (file: File): boolean =>
              !workspace.config.skipPaths.some((path): boolean => file.resource.path.startsWith(path)),
          )
        }

        spinner.prefixText = `Deploying ${fileType}`

        for (let file of files) {
          if (path && file.location.split(path)[1] !== '') {
            continue
          }

          spinner.text = file.resource.path
          await file.read()
          await client.saveFile(file.resource)
        }
        spinner.prefixText = 'Deployed'
        spinner.succeed(fileType).start()
      },
    )
    spinner.prefixText = ''
    if (!path) {
      spinner.text = workspace.config.ignoreSpecs
        ? `Deployed all non-spec files to ${workspace.name}`
        : `Deployed all files to ${workspace.name}`
    }
    spinner.succeed()

    console.log(``)
  } catch (e) {
    spinner.text = client.handleError(e)
    spinner.fail()
    throw e
  }
}

export default async (args: any): Promise<void> => {
  if (!args.preserve) {
    await wipe(args)
  }

  let workspace: Workspace

  try {
    workspace = await Workspace.init(
      args.workspace,
      args.disableSSLVerification,
      args.ignoreSpecs,
      args.skipPath,
      args.enablePath,
    )
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

    watcher.on('change', (path: any, stats: { isFile: () => any }): void => {
      if (stats && stats.isFile()) {
        Deploy(workspace, path)
      }
    })
  }
}
