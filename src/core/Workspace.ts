import * as rs from 'recursive-readdir-async'
import * as fs from 'fs-extra'
import * as path from 'upath'

import WorkspaceConfig from './WorkspaceConfig'
import WorkspacePortalConfig from './WorkspacePortalConfig'
import WorkspaceRouterConfig from './WorkspaceRouterConfig'

export default class Workspace {
  public name: string
  public path: string
  public config: WorkspaceConfig
  public portalConfig: WorkspacePortalConfig
  public routerConfig: WorkspaceRouterConfig

  public constructor(name: string) {
    this.name = name
    this.path = Workspace.getDirectoryPath(name)
    this.config = new WorkspaceConfig(this.path, 'cli.conf.yaml')
    this.portalConfig = new WorkspacePortalConfig(this.path, 'portal.conf.yaml')
    this.routerConfig = new WorkspaceRouterConfig(this.path, 'router.conf.yaml')
  }

  public static async init(name: string): Promise<Workspace> {
    const workspace = new Workspace(name)
    await workspace.config.load()

    if (process.env.KONG_ADMIN_URL) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      workspace.config.data.kong_admin_url = process.env.KONG_ADMIN_URL
    }

    if (process.env.KONG_ADMIN_TOKEN) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      workspace.config.data.kong_admin_token = process.env.KONG_ADMIN_TOKEN
    }

    console.log('Config:')
    console.log('')
    console.log('\t', 'Workspace:', workspace.name)

    if (workspace.config.kongAdminUrl) {
      console.log(
        '\t',
        'Workspace Upstream:',
        `${workspace.config.kongAdminUrl}/${workspace.name}`,
        workspace.config.kongAdminToken ? '(authenticated)' : '',
      )
    } else if (workspace.config.upstream) {
      console.log(
        '\t',
        'Workspace Upstream:',
        `${workspace.config.upstream}`,
        workspace.config.kongAdminToken ? '(authenticated)' : '',
      )
    }

    console.log('\t', 'Workspace Directory:', workspace.path)
    console.log('')
    console.log('Changes:')
    console.log('')

    await workspace.portalConfig.load()
    await workspace.routerConfig.load()

    return workspace
  }

  public static async exists(name: string): Promise<boolean> {
    try {
      const stat = await fs.lstat(Workspace.getDirectoryPath(name))
      return stat && stat.isDirectory()
    } catch (e) {
      return false
    }
  }

  public static getDirectoryPath(name: string): string {
    return path.join(process.cwd(), 'workspaces', name)
  }
}
