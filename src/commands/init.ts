import * as fs from 'fs-extra'
import { join } from 'upath'

import File from '../core/File'

const cliConf: string =`# Kong Admin URL
# @required
kong_admin_url: http://localhost:8001

# Kong Admin Token
# @optional
kong_admin_token: ''`

export default async (args): Promise<void> => {

  let path = join("workspaces", args.workspace)

  await fs.mkdir(path, { recursive: true }, (err) => {
    if (err) throw err
  })

  let file: File = new File(join(path, "cli.conf.yaml"), path)

  if (await file.exists()) {
    console.log("cli.conf.yaml already exist in workspace '" + args.workspace + "'")
  } else {
    file.write(cliConf)

    console.log("")
    console.log("Workspace '" + args.workspace + "' initialized.")
  }
  
}
