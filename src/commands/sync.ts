import * as chokidar from 'chokidar'
import ora from 'ora'

import Workspace from '../core/Workspace'
import RestClient from '../core/HTTP/RestClient'
import File from '../core/File'

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
      return !(/\//.test(file.resource.path || ''))
    })

    files = files.filter((file): boolean => {
      return /\//.test(file.resource.path || '')
    })
    return files
  }

  fileObj[filterBy] = files.filter((file) => {
    return file.resource.path?.startsWith(filterBy)
  })

  files = files.filter((file) => {
    return !file.resource.path?.startsWith(filterBy)
  })
  return files
}

async function Sync(workspace: Workspace, path?: string): Promise<void> {
  console.log(`Syncing ${workspace.name}:`)
  console.log(``)

  const spinner = ora({
    prefixText: `Deploying ${path || 'file'}...`,
    text: `reading files...`,
  }).start()

  const client = new RestClient(workspace.config, workspace.name)
  const remoteFiles = await client.getAllFiles({ fields: 'path,checksum' })

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

    await asyncForEach(Object.keys(fileObj), async (fileType): Promise<void> => {
      if (fileType === 'specs' && workspace.config.ignoreSpecs) {
        return
      }
      let files: File[] = fileObj[fileType]

      if (workspace.config.skipPaths && workspace.config.skipPaths.length > 0) {
        files = fileObj[fileType].filter(
          (file: File): boolean => !workspace.config.skipPaths.some((path) => file.resource.path?.startsWith(path)),
        )
      }

      spinner.prefixText = `Syncing ${fileType}`

      for (const file of files) {
        if (path && file.location.split(path)[1] !== '') {
          console.debug(`ignoring ${file.location} - path not targeted`)
          continue
        }

        // read local file
        await file.read()

        const remoteFile = remoteFiles.find((f) => f.path?.toLowerCase() === file.resource.path?.toLowerCase())
        const remoteFileChecksum = remoteFile?.checksum
        const localFileChecksum = await file.getShaSum()

        // check if the same file and its contents exist on the remote server
        if (remoteFile && remoteFileChecksum === localFileChecksum) {
          console.debug(`ignoring ${file.location} - remote file unchanged`)
          continue
        }

        spinner.text = file.resource.path || file.resource.id || 'file'
        await client.saveFile(file.resource)
        console.log('saving ', file.resource.path, remoteFileChecksum, localFileChecksum)
      }

      // delete upstream files that don't exist locally anymore
      for (const remoteFile of remoteFiles) {
        // process only the current type
        if (!remoteFile.path?.startsWith(`${fileType}/`)) {
          // console.debug(`ignoring ${remoteFile.path} - type not targeted`)
          continue
        }

        if (files.findIndex((f) => f.resource.path === remoteFile.path) !== -1) {
          console.debug(`ignoring ${remoteFile.path} - file just uploaded`)
          continue
        }

        const localFile = workspace.files.find((f) => f.resource.path === remoteFile.path)
        if (!localFile) {
          console.debug('remote file ', remoteFile.path, 'not found locally')
          console.debug(workspace.files)

          spinner.text = remoteFile.path || 'file'
          console.log('deleting ', remoteFile.path)
          await client.deleteFile(remoteFile)
        }
      }

      spinner.prefixText = 'Deployed'
      spinner.succeed(fileType).start()
    })
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
  let workspace: Workspace

  try {
    workspace = await Workspace.init(args.workspace, args.disableSSLVerification, args.ignoreSpecs, args.skipPath)
  } catch (e) {
    return MissingWorkspaceError(args.workspace)
  }

  await Sync(workspace)

  if (args.watch) {
    console.log(`Watching`, `${workspace.path}/*`)
    console.log(``)

    const watcher = chokidar.watch('.', {
      cwd: workspace.path,
      alwaysStat: true,
    })

    watcher.on('change', (path, stats) => {
      if (stats && stats.isFile()) {
        Deploy(workspace, path)
      }
    })
  }
}
