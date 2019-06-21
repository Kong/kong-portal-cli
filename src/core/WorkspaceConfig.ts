import Config from './Config';

export default class WorkspaceConfig extends Config {
  public get name(): string {
    return this.data.name;
  }

  public set name(name: string) {
    this.data.name = name;
  }

  public get description(): string {
    return this.data.description;
  }

  public set description(text: string) {
    this.data.description = text;
  }

  public get upstream(): string {
    return this.data.upstream;
  }

  public set upstream(url: string) {
    this.data.upstream = url;
  }

  public get rbacToken(): string {
    // eslint-disable-next-line @typescript-eslint/camelcase
    return this.data.rbac_token;
  }

  public set rbacToken(token: string) {
    // eslint-disable-next-line @typescript-eslint/camelcase
    this.data.rbac_token = token;
  }
}
