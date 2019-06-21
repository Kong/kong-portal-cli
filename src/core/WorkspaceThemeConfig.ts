import Config from './Config';

export default class WorkspaceThemeConfig extends Config {
  public get colors(): string {
    return this.data.colors;
  }

  public set colors(colors: string) {
    this.data.colors = colors;
  }
}
