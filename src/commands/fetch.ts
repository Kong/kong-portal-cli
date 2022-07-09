import { join } from 'upath'
import { isBinaryFile } from 'isbinaryfile'

import File from '../core/File'
import Workspace from '../core/Workspace'
import RestClient from '../core/HTTP/RestClient'

import { MissingWorkspaceError } from '../helpers'

async function shouldRewriteFile(resource, file: File, keepEncode: boolean): Promise<boolean> {
  const shasum = await file.getShaSum()

  if (shasum !== resource.checksum) {
    return true
  }
  if (keepEncode && (await isBinaryFile(file.location))) {
    return true
  }
  if (!keepEncode && file.isBase64Asset()) {
    await file.read()
    if (file.resource.contents.startsWith('data:')) {
      return true
    }
  }

  return false
}

export default async (args): Promise<void> => {
  let workspace: Workspace

  try {
    workspace = await Workspace.init(args.workspace, args.disableSSLVerification, args.ignoreSpecs)
  } catch (e) {
    return MissingWorkspaceError(args.workspace)
  }

  const client = new RestClient(workspace.config, workspace.name)
  let response
  try {
    response = await client.getAllFiles()
  } catch (e) {
    console.log(e)
    return
  }

  let added = 0
  let modified = 0
  let specs = 0

  if (response) {
    for (const resource of response) {
      if (workspace.config.ignoreSpecs && resource.path.startsWith('specs')) {
        specs++
        continue
      }
      const path: string = join(workspace.path, resource.path)
      const file: File = new File(path, workspace.path)
      if (await file.exists()) {
        if (await shouldRewriteFile(resource, file, args.keepEncode)) {
          file.write(resource.contents)
          console.log('\t', 'Modified:', resource.path)
          modified++
        }
      } else {
        file.write(resource.contents)
        console.log('\t', 'Added:', resource.path)
        added++
      }
    }
  }

  console.log('\t', `Fetched ${response.length} files`)

  if (specs) {
    console.log('\t', `Ignored ${specs} specs`)
  }

  if (!modified || added) {
    console.log('\t', 'No changes.')
  }

  console.log('')
  console.log('Done.')
}
