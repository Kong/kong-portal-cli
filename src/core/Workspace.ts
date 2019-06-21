import * as fs from 'fs-extra';
import * as path from 'path';

import WorkspaceTheme from './WorkspaceTheme';
import WorkspaceConfig from './WorkspaceConfig';
import WorkspacePortalConfig from './WorkspacePortalConfig';

export default class Workspace {
  public name: string;
  public location: string;
  public config: WorkspaceConfig;
  public portalConfig: WorkspacePortalConfig;

  public constructor(name: string) {
    this.name = name;
    this.location = Workspace.getDirectoryPath(name);
    this.config = new WorkspaceConfig(this.location, 'cli.conf.yaml');
    this.portalConfig = new WorkspacePortalConfig(this.location, 'portal.conf.yaml');
  }

  public async getCurrentTheme(): Promise<WorkspaceTheme> {
    return await WorkspaceTheme.init(this.location, this.getCurrentThemeName());
  }

  public getCurrentThemeName(): string {
    return this.portalConfig.theme;
  }

  public getLocation(): string {
    return this.location;
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
