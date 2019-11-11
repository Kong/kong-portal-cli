import * as rs from 'recursive-readdir-async';
import * as fs from 'fs-extra';
import * as path from 'upath';

import WorkspaceTheme from './WorkspaceTheme';
import WorkspaceConfig from './WorkspaceConfig';
import WorkspacePortalConfig from './WorkspacePortalConfig';
import WorkspaceContent from './WorkspaceContent';
import WorkspaceSpecs from './WorkspaceSpecs';
import WorkspaceRouterConfig from './WorkspaceRouterConfig';

export default class Workspace {
  public name: string;
  public path: string;
  public config: WorkspaceConfig;
  public portalConfig: WorkspacePortalConfig;
  public routerConfig: WorkspaceRouterConfig;

  public constructor(name: string) {
    this.name = name;
    this.path = Workspace.getDirectoryPath(name);
    this.config = new WorkspaceConfig(this.path, 'cli.conf.yaml');
    this.portalConfig = new WorkspacePortalConfig(this.path, 'portal.conf.yaml');
    this.routerConfig = new WorkspaceRouterConfig(this.path, 'router.conf.yaml');
  }

  public getCurrentThemeName(): string {
    return this.portalConfig.theme;
  }

  public async getContent(): Promise<WorkspaceContent> {
    return await WorkspaceContent.init(this.path);
  }

  public async getSpecs(): Promise<WorkspaceSpecs> {
    return await WorkspaceSpecs.init(this.path);
  }

  public async getTheme(name: string): Promise<WorkspaceTheme> {
    return await WorkspaceTheme.init(this.path, name);
  }

  public async getCurrentTheme(): Promise<WorkspaceTheme> {
    return this.getTheme(this.getCurrentThemeName());
  }

  public async getThemes(): Promise<WorkspaceTheme[]> {
    let workspaceThemes: WorkspaceTheme[] = [];
    let themes: any = await rs.list(path.join(this.path, 'themes'), {
      recursive: false,
      ignoreFolders: false,
    });

    themes = themes.filter((element: any): boolean => element.isDirectory);

    for (let theme of themes) {
      workspaceThemes.push(await this.getTheme(theme.name));
    }

    return workspaceThemes;
  }

  public getLocation(): string {
    return this.path;
  }

  public getConfig(key: string): any {
    return key ? this.config[key] : this.config;
  }

  public getPortalConfig(key: string): any {
    return key ? this.portalConfig[key] : this.portalConfig;
  }

  public static async init(name: string): Promise<Workspace> {
    const workspace = new Workspace(name);
    await workspace.config.load();
    await workspace.portalConfig.load();
    await workspace.routerConfig.load();

    return workspace;
  }

  public static async exists(name: string): Promise<boolean> {
    try {
      const stat = await fs.lstat(Workspace.getDirectoryPath(name));
      return stat && stat.isDirectory();
    } catch (e) {
      return false;
    }
  }

  public static getDirectoryPath(name: string): string {
    return path.join(process.cwd(), 'workspaces', name);
  }
}
