import * as rs from 'recursive-readdir-async';
import * as fs from 'fs-extra';
import { join } from 'path';

import WorkspaceThemeConfig from './WorkspaceThemeConfig';

export default class WorkspaceTheme {
  public name: string;
  public path: string;
  public location: string;

  public config: WorkspaceThemeConfig;

  public assetsPath: string;
  public layoutsPath: string;
  public partialsPath: string;

  public assets: Record<string, any>[] | null;
  public layouts: Record<string, any>[] | null;
  public partials: Record<string, any>[] | null;

  public constructor(location: string, name: string) {
    this.name = name;
    this.location = location;
    this.path = WorkspaceTheme.getDirectoryPath(location, name);

    this.config = new WorkspaceThemeConfig(this.path, 'theme.conf.yaml');

    this.assetsPath = join(this.path, 'assets');
    this.layoutsPath = join(this.path, 'layouts');
    this.partialsPath = join(this.path, 'partials');

    this.assets = null;
    this.layouts = null;
    this.partials = null;
  }

  public async scan(): Promise<void> {
    this.assets = await rs.list(this.assetsPath);
    this.layouts = await rs.list(this.layoutsPath);
    this.partials = await rs.list(this.partialsPath);
  }

  public async addLayout(): Promise<void> {
    console.log('not yet implemented');
  }

  public async addPartial(): Promise<void> {
    console.log('not yet implemented');
  }

  public outputStatsToConsole(): void {
    const assetsLength: number = this.assets ? this.assets.length : 0;
    const layoutsLength: number = this.layouts ? this.layouts.length : 0;
    const partialsLength: number = this.partials ? this.partials.length : 0;

    console.log(``);
    console.log(`Total Theme Files:`, assetsLength + layoutsLength + partialsLength);
    console.log(`  `, `Assets:`, assetsLength);
    console.log(`  `, `Layouts:`, layoutsLength);
    console.log(`  `, `Partials:`, partialsLength);
  }

  public static async init(location: string, name: string): Promise<WorkspaceTheme> {
    const theme = new WorkspaceTheme(location, name);
    await theme.config.load();
    await theme.scan();
    return theme;
  }

  public static async exists(location: string, name: string): Promise<boolean> {
    try {
      const stat = await fs.lstat(WorkspaceTheme.getDirectoryPath(location, name));
      return stat && stat.isDirectory();
    } catch (e) {
      return false;
    }
  }

  public static getDirectoryPath(location: string, name: string): string {
    return join(location, 'themes', name);
  }
}
