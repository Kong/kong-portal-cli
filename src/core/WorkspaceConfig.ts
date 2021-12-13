import Config from './Config'
import { OutgoingHttpHeaders } from './HTTP/RestInterfaces'

export interface IWorkspaceConfig {
  data: {}
  name?: string
  description?: string
  upstream?: string
  headers?: OutgoingHttpHeaders
  kongAdminUrl?: string
  kongAdminToken?: string
  disableSSLVerification?: boolean
  ignoreSpecs?: boolean
  skipPaths?: string[]
}

export default class WorkspaceConfig extends Config implements IWorkspaceConfig {
  /**
   * @deprecated
   */
  public get name(): string {
    return this.data.name
  }

  /**
   * @deprecated
   */
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
    return this.data.kong_admin_url
  }

  public set kongAdminUrl(url: string) {
    this.data['kong_admin_url'] = url
  }

  /**
   * @deprecated
   */
  public get upstream(): string {
    return this.data.upstream
  }

  /**
   * @deprecated
   */
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
    this.data['kong_admin_token'] = token
  }

  public set disableSSLVerification(isDisable: boolean) {
    this.data['disable_ssl_verification'] = isDisable
  }

  public get disableSSLVerification(): boolean {
    return this.data.disable_ssl_verification
  }

  public set ignoreSpecs(isIgnore: boolean) {
    this.data['ignore_specs'] = isIgnore
  }

  public get ignoreSpecs(): boolean {
    return this.data.ignore_specs
  }

  public set skipPaths(skipPaths: string[]) {
    this.data['skip_paths'] = skipPaths
  }

  public get skipPaths(): string[] {
    return this.data.skip_paths
  }
}
