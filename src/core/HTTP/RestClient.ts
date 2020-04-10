import { IWorkspaceConfig } from '../WorkspaceConfig'
import { OutgoingHttpHeaders, IRestResponse, IRestResource } from './RestInterfaces'
import * as got from 'got'
import { GotOptions } from 'got'
export class RestClientError<T> extends Error {
  public response: IRestResponse<T>

  public constructor(res: IRestResponse<T>, message?: string) {
    super(message)
    this.response = res
  }
}

export default class RestClient {
  public client
  public clientHeaders
  public clientUrl: string
  public workspaceName: string

  public constructor(workspaceConfig: IWorkspaceConfig, workspaceName: string) {
    this.clientHeaders = workspaceConfig.headers || {}
    this.workspaceName = workspaceName

    if (workspaceConfig.kongAdminUrl) {
      this.clientUrl = `${workspaceConfig.kongAdminUrl}/`
    } else if (workspaceConfig.upstream) {
      console.log(
        'upstream is deprecated and will cease to function in a later release. Please use kong_admin_url (upstream url without the workspace suffix)',
      )
      this.clientUrl = workspaceConfig.upstream
    } else {
      this.clientUrl = ''
    }

    if (workspaceConfig.kongAdminToken) {
      this.clientHeaders['Kong-Admin-Token'] = workspaceConfig.kongAdminToken
    }

    const options: GotOptions = {
      prefixUrl: this.clientUrl,
      headers: this.clientHeaders,
      responseType: 'json',
    }

    this.client = got.default.extend(options)
  }

  public async get<T>(resource: string, options: Partial<got.GotOptions> = {}): Promise<IRestResponse<T>> {
    console.log(resource)
    return this.handleResponse(await this.client.get(resource, options))
  }

  public async getAll<T>(resource: string, options: Partial<got.GotOptions> = {}): Promise<IRestResponse<T>> {
    return this.handleResponse(await this.client.get(`${this.workspaceName}/${resource}`, options))
  }

  public async create<Output>(
    resource: IRestResource,
    options: Partial<got.GotOptions> = {},
  ): Promise<IRestResponse<Output>> {
    options.body = resource.toObject()
    return this.handleResponse(await this.client.post(resource.getResourcePath(), options))
  }

  public async update<Output>(
    resource: IRestResource,
    options: Partial<got.GotOptions> = {},
  ): Promise<IRestResponse<Output>> {
    options.body = resource.toObject()
    return this.handleResponse(await this.client.patch(resource.getResourcePath(), options))
  }

  public async save<Output>(
    resource: IRestResource,
    options: Partial<got.GotOptions> = {},
  ): Promise<IRestResponse<Output>> {
    options.body = resource.toObject()
    try {
      let response = await this.client.put(resource.getResourcePath(), options)
      return this.handleResponse(response)
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  public async delete<T>(resource: IRestResource, options: Partial<got.GotOptions> = {}): Promise<IRestResponse<T>> {
    return this.handleResponse(await this.client.delete(resource.getResourcePath(), options))
  }

  private handleResponse<T>(res: any): IRestResponse<T> {
    let statusCode: number = res.statusCode || 500
    let result: any = res.body

    if (statusCode > 399) {
      throw new RestClientError<T>({
        statusCode,
        result,
        headers: res.headers,
      })
    }

    const response: IRestResponse<T> = {
      statusCode,
      result,
      headers: res.headers,
    }

    return response
  }
}
