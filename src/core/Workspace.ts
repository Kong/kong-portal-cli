import { list as recursiveListFiles } from 'recursive-readdir-async'
import * as fs from 'fs-extra'
import { readFileSync } from 'fs'
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

  public static async init(
    name: string,
    disableSSLVerification?: boolean,
    ignoreSpecs?: boolean,
    skipPath?: string[],
    enablePath?: string[],
  ): Promise<Workspace> {
    if ((await this.exists(name)) === false) {
      throw new Error()
    }
    const workspace = new Workspace(name)
    await workspace.config.load()
    await workspace.portalConfig.load()
    await workspace.routerConfig.load()

    if (process.env.KONG_ADMIN_URL) {
      workspace.config.data.kong_admin_url = process.env.KONG_ADMIN_URL
    }

    if (process.env.KONG_ADMIN_TOKEN_FILE) {
      if ((await this.exists(process.env.KONG_ADMIN_TOKEN_FILE)) === false) {
        console.log(`File specified by KONG_ADMIN_TOKEN_FILE is missing at ${process.env.KONG_ADMIN_TOKEN_FILE}`)
        console.log(``)
        throw new Error()
      }

      workspace.config.data.kong_admin_token = readFileSync(process.env.KONG_ADMIN_TOKEN_FILE, 'utf-8').trim()
    } else {
      if (process.env.KONG_ADMIN_TOKEN) {
        workspace.config.data.kong_admin_token = process.env.KONG_ADMIN_TOKEN
      }
    }

    if (disableSSLVerification) {
      workspace.config.data.disable_ssl_verification = true
    }
    if (ignoreSpecs) {
      workspace.config.data.ignore_specs = true
    }

    if (skipPath && skipPath.length > 0) {
      workspace.config.data.skip_paths = skipPath
    }

    if (enablePath && enablePath.length > 0) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      workspace.config.data.enable_paths = enablePath
    }
    return workspace
  }

  public async scan(): Promise<File[]> {
    const files = await recursiveListFiles(this.path, { exclude: ['.DS_Store', 'cli.conf.yaml'] })
    if (!files || !Array.isArray(files)) {
      throw new Error(`Unable to scan directories: ${files.error || 'unknown error'}`)
    }

    this.files = files.map((file) => new File(file.fullname, this.path))
    return this.files
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
    const workspaceThemes: WorkspaceTheme[] = []
    let themes: any = await recursiveListFiles(join(this.path, 'themes'), {
      recursive: false,
      ignoreFolders: false,
    })

    themes = themes.filter((element: any): boolean => element.isDirectory)

    for (const theme of themes) {
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
