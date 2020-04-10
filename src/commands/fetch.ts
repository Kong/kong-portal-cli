
import { join } from 'upath'
import { isBinaryFile } from 'isbinaryfile'

import File from '../core/File'
import Workspace from '../core/Workspace'
import RestClient from '../core/HTTP/RestClient'

import { MissingWorkspaceError } from '../helpers'

function writeOrWrite64(contents: string, file: File, keepEncode: boolean): void {
  if (!keepEncode && file.location.includes('assets') && contents.startsWith('data:')) {
    file.write64(contents)
    return
  }
  file.write(contents)
}

async function shouldRewriteFile(resource, file: File, keepEncode: boolean): Promise<boolean> {
  const shasum = await file.getShaSum()

  if (shasum !== resource.checksum) {
    return true
  }
  if (keepEncode && (await isBinaryFile(file.location))) {
    return true
  }
  if (!keepEncode && file.location.includes('assets')) {
    const contents = await file.read()
    if (contents.startsWith('data:')) {
      return true
    }
  }

  return false
}

export default async (args): Promise<void> => {
  let workspace: Workspace
  let client: RestClient

  try {
    workspace = await Workspace.init(args.workspace)
  } catch (e) {
    return MissingWorkspaceError(args.workspace)
  }

  client = new RestClient(workspace.config, workspace.name)
  let response
  try {
    response = await client.getAll('files')
  } catch (e) {
    console.log(e)
    throw e
    return
  }

  let added = 0
  let modified = 0

  if (response.result && response.result.data) {
    for (let resource of response.result.data) {
      let path: string = join(workspace.path, resource.path)
      let file: File = new File(path)
      if (await file.exists()) {
        if (await shouldRewriteFile(resource, file, args.keepEncode)) {
          writeOrWrite64(resource.contents, file, args.keepEncode)
          console.log('\t', 'Modified:', resource.path)
          modified += 1
        }
      } else {
        writeOrWrite64(resource.contents, file, args.keepEncode)
        console.log('\t', 'Added:', resource.path)
        added += 1
      }
    }
  }

  if (!modified || added) {
    console.log('\t', 'No changes.')
  }

  console.log('')
  console.log('Done.')
}
