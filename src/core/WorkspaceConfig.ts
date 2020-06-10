import Config from './Config'
import { OutgoingHttpHeaders } from './HTTP/RestInterfaces'

export interface IWorkspaceConfig {
  name?: string
  description?: string
  upstream?: string
  headers?: OutgoingHttpHeaders
  kongAdminUrl?: string
  kongAdminToken?: string
  ignoreSpecs?: boolean
}

export default class WorkspaceConfig extends Config implements IWorkspaceConfig {
  // deprecated
  public get name(): string {
    return this.data.name
  }

  // deprecated
  public set name(name: string) {
    this.data.name = name
  }

  public get description(): string {
    return this.data.description
  }

  public set description(text: string) {
    this.data.description = text
  }

  public get kongAdminUrl(): string {
    // eslint-disable-next-line @typescript-eslint/camelcase
    return this.data.kong_admin_url
  }

  public set kongAdminUrl(url: string) {
    // eslint-disable-next-line @typescript-eslint/camelcase
    this.data.kong_admin_url = url
  }

  // deprecated
  public get upstream(): string {
    return this.data.upstream
  }

  // deprecated
  public set upstream(url: string) {
    this.data.upstream = url
  }

  public get headers(): OutgoingHttpHeaders {
    return this.data.headers || {}
  }

  public set headers(headers: OutgoingHttpHeaders) {
    this.data.headers = headers
  }

  public get kongAdminToken(): string {
    // eslint-disable-next-line @typescript-eslint/camelcase
    return this.data.kong_admin_token
  }

  public set kongAdminToken(token: string) {
    // eslint-disable-next-line @typescript-eslint/camelcase
    this.data.kong_admin_token = token
  }

  public set ignoreSpecs(isDisable: boolean) {
    // eslint-disable-next-line @typescript-eslint/camelcase
    this.data.disable_ssl_verification = isDisable
  }

  public get ignoreSpecs(): boolean {
    // eslint-disable-next-line @typescript-eslint/camelcase
    return this.data.disable_ssl_verification
  }
}
