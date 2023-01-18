import * as chokidar from 'chokidar'
import ora from 'ora'

import Workspace from '../core/Workspace'
import RestClient from '../core/HTTP/RestClient'
import File from '../core/File'

import { arrayPartition, MissingWorkspaceError } from '../helpers'

const enum GroupType {
  configs = 'configs',
  content = 'content',
  specs = 'specs',
  emails = 'emails',
  themes = 'themes',
  others = 'others',
}

interface ISyncArguments {
  workspace: string
  disableSSLVerification?: boolean
  ignoreSpecs?: boolean
  skipPath?: string[]
  verbose?: boolean
  watch?: boolean
}

interface ISyncOptions {
  path?: string
}

type FileGroups = Partial<Record<GroupType, File[]>>

function buildFilesObject(fileGroups: FileGroups, files: File[], filterBy: GroupType): File[] {
  // each time this function runs we create a new property based on filterBy and remove it from files
  // this way we never miss anything from files

  if (filterBy === GroupType.configs) {
    // find files in the root directory and add them to the configs group
    const { matched, mismatched } = arrayPartition(files, (file) => !/\//.test(file.resource.path || ''))
    fileGroups.configs = matched
    files = mismatched

    return files
  }

  // find files with paths starting with filterBy and add them to their group
  const { matched, mismatched } = arrayPartition(files, (file) => file.resource.path?.startsWith(filterBy))
  fileGroups[filterBy] = matched

  return mismatched
}

async function Sync(workspace: Workspace, args: ISyncArguments, options: ISyncOptions = {}): Promise<void> {
  console.log(`Syncing ${workspace.name}:\n`)

  const verbose = (...verboseArgs) => args.verbose && console.debug(...verboseArgs)

  const spinner = ora({
    prefixText: `Syncing ${options.path || 'all workspace files'}...`,
    text: `reading files...`,
  }).start()

  const client = new RestClient(workspace.config, workspace.name)

  try {
    // scan upstream workspace files
    const upstreamFiles = await client.getAllFiles({ fields: 'path,checksum' })

    // scan workspace directories and build list of files
    const allFiles = await workspace.scan()

    spinner.text = `Found ${allFiles.length} files locally and ${upstreamFiles.length} files upstream`
    spinner.succeed().start()

    // assign files to their groups
    const fileGroups: FileGroups = {}
    let remainingFiles = [...allFiles]
    remainingFiles = buildFilesObject(fileGroups, remainingFiles, GroupType.configs)
    remainingFiles = buildFilesObject(fileGroups, remainingFiles, GroupType.content)
    remainingFiles = buildFilesObject(fileGroups, remainingFiles, GroupType.specs)
    remainingFiles = buildFilesObject(fileGroups, remainingFiles, GroupType.emails)
    remainingFiles = buildFilesObject(fileGroups, remainingFiles, GroupType.themes)

    if (allFiles.length > 0) {
      fileGroups[GroupType.others] = remainingFiles
    }

    const updatedPaths: string[] = []
    const deletedPaths: string[] = []

    for (const [group, files] of Object.entries(fileGroups)) {
      if (group === GroupType.specs && workspace.config.ignoreSpecs) {
        return
      }

      // check skipPaths
      let filesToCompare = files
      if (workspace.config.skipPaths?.length) {
        filesToCompare = filesToCompare.filter(
          (file) => !workspace.config.skipPaths.some((path) => file.resource.path?.startsWith(path)),
        )
      }

      for (const file of filesToCompare) {
        const upstreamFile = upstreamFiles.find((upstreamFile) => file.resource.path === upstreamFile.path)
        const localChecksum = await file.getShaSum()
        const upstreamChecksum = upstreamFile?.checksum

        if (upstreamChecksum && localChecksum === upstreamChecksum) {
          verbose(`[${upstreamFile.path}] file up to date`)
          continue
        }

        if (!file.resource.path) {
          // this should never happen
          continue
        }

        spinner.text = file.resource.path || 'file'
        await client.saveFile(file.resource)
        updatedPaths.push(file.resource.path)

        verbose(`[${file.resource.path}] updated`)
      }

      // delete any upstream files that don't exist locally (anymore)
      const upstreamFilesToDelete = upstreamFiles.filter((file) => {
        // ignore files with no path
        if (!file.path) {
          return false
        }

        // ignore files from other groups
        if (!file.path.startsWith(`${group}/`)) {
          return false
        }

        // ignore files added to skipPaths configuration option
        if (workspace.config.skipPaths?.some((path) => file.path?.startsWith(path))) {
          return false
        }

        // don't delete files that exist locally
        if (files.find((f) => f.resource.path === file.path)) {
          return false
        }

        // don't delete just uploaded files. Upstream files were fetched before uploading any files
        return !updatedPaths.includes(file.path)
      })

      for (const file of upstreamFilesToDelete) {
        if (!file.path) {
          // this should never happen
          continue
        }

        spinner.text = file.path
        await client.deleteFile(file)
        deletedPaths.push(file.path)
      }

      spinner.prefixText = 'Synchronized'
      spinner.succeed(group).start()
    }

    spinner.prefixText = ''
    spinner.text = [
      `Synchronized all ${allFiles.length} (${updatedPaths.length} updated, ${deletedPaths.length} deleted)`,
      workspace.config.ignoreSpecs && 'non-spec',
      'changes',
      options.path && `inside ${options.path}`,
      `to ${workspace.name}`,
    ]
      .filter(Boolean)
      .join(' ')

    spinner.succeed()
    console.log('')
  } catch (e) {
    spinner.text = client.handleError(e)
    spinner.fail()
    throw e
  }
}

export default async (args: ISyncArguments): Promise<void> => {
  let workspace: Workspace

  try {
    workspace = await Workspace.init(args.workspace, args.disableSSLVerification, args.ignoreSpecs, args.skipPath)
  } catch (e) {
    return MissingWorkspaceError(args.workspace)
  }

  await Sync(workspace, args)

  if (args.watch) {
    console.log(`Watching`, `${workspace.path}/*`)
    console.log(``)

    const watcher = chokidar.watch('.', {
      cwd: workspace.path,
      alwaysStat: true,
    })

    watcher.on('change', (path, stats) => {
      if (stats && stats.isFile()) {
        Sync(workspace, args, { path })
      }
    })
  }
}
