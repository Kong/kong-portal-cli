import * as rs from 'recursive-readdir-async'
import * as fs from 'fs-extra'
import { join } from 'upath'

import WorkspaceConfig from './WorkspaceConfig'
import WorkspaceTheme from './WorkspaceTheme'
import Config from './Config'

import File from './File'

export default class Workspace {
  public name: string
  public path: string
  public files: File[]
  public config: WorkspaceConfig
  public portalConfig: Config
  public routerConfig: Config

  public constructor(name: string) {
    this.files = []
    this.name = name
    this.path = Workspace.getDirectoryPath(name)
    this.config = new WorkspaceConfig(this.path, 'cli.conf.yaml')
    this.portalConfig = new Config(this.path, 'portal.conf.yaml')
    this.routerConfig = new Config(this.path, 'router.conf.yaml')
  }

  public static async init(name: string): Promise<Workspace> {
    const workspace = new Workspace(name)
    await workspace.config.load()
    await workspace.portalConfig.load()
    await workspace.routerConfig.load()

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

    return workspace
  }

  public async scan(): Promise<void> {
    let files = await rs.list(this.path, { exclude: ['.DS_Store'] })

    if (files) {
      this.files = files.map(
        (file: any): File => {
          return new File(file.fullname, this.path)
        },
      )
    }
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
    return join(process.cwd(), 'workspaces', name)
  }

  public async getThemes(): Promise<WorkspaceTheme[]> {
    let workspaceThemes: WorkspaceTheme[] = []
    let themes: any = await rs.list(join(this.path, 'themes'), {
      recursive: false,
      ignoreFolders: false,
    })

    themes = themes.filter((element: any): boolean => element.isDirectory)

    for (let theme of themes) {
      workspaceThemes.push(await this.getTheme(theme.name))
    }

    return workspaceThemes
  }

  public getCurrentThemeName(): string {
    return this.portalConfig.data.theme.name
  }

  public async getTheme(name: string): Promise<WorkspaceTheme> {
    return await WorkspaceTheme.init(this.path, name)
  }

  public async getCurrentTheme(): Promise<WorkspaceTheme> {
    return this.getTheme(this.getCurrentThemeName())
  }

}
