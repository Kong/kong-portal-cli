import Config from './Config';

export default class WorkspacePortalConfig extends Config {
  public get theme(): string {
    return this.data.theme;
  }

  public set theme(theme: string) {
    this.data.theme = theme;
  }
}
