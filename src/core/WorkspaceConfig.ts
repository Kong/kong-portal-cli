import Config from './Config';
import { OutgoingHttpHeaders } from './HTTP/RestInterfaces';

export interface IWorkspaceConfig {
  name?: string;
  description?: string;
  upstream?: string;
  adminUrl?: string;
  headers?: OutgoingHttpHeaders;
  rbacToken?: string;
}

export default class WorkspaceConfig extends Config implements IWorkspaceConfig {
  // deprecated
  public get name(): string {
    return this.data.name;
  }

  // deprecated
  public set name(name: string) {
    this.data.name = name;
  }

  public get description(): string {
    return this.data.description;
  }

  public set description(text: string) {
    this.data.description = text;
  }

  public get adminUrl(): string {
    // eslint-disable-next-line @typescript-eslint/camelcase
    return this.data.admin_url;
  }

  public set adminUrl(url: string) {
    // eslint-disable-next-line @typescript-eslint/camelcase
    this.data.admin_url = url;
  }

  // deprecated
  public get upstream(): string {
    return this.data.upstream;
  }

  // deprecated
  public set upstream(url: string) {
    this.data.upstream = url;
  }

  public get headers(): OutgoingHttpHeaders {
    return this.data.headers || {};
  }

  public set headers(headers: OutgoingHttpHeaders) {
    this.data.headers = headers;
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
