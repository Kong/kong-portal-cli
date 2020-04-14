import { IWorkspaceConfig } from '../WorkspaceConfig'
import { OutgoingHttpHeaders, IRestResponse, IRestResource } from './RestInterfaces'
import { FileResourceJSON } from './Resources/FileResource'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

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

  public constructor(workspaceConfig: IWorkspaceConfig, workspaceName: string) {
    this.clientHeaders = workspaceConfig.headers || {}
    let workspaceUrl

    if (workspaceConfig.kongAdminUrl) {
      // workspaceUrl is removed when paginating, kong offset includes it.
      this.clientUrl = `${workspaceConfig.kongAdminUrl}`
      workspaceUrl = workspaceName
    } else if (workspaceConfig.upstream) {
      console.log(
        'upstream is deprecated and will cease to function in a later release. Please use kong_admin_url (upstream url without the workspace suffix)',
      )
      this.clientUrl = workspaceConfig.upstream
      this.clientUrl = ''
    } else {
      this.clientUrl = ''

    }

    if (workspaceConfig.kongAdminToken) {
      this.clientHeaders['Kong-Admin-Token'] = workspaceConfig.kongAdminToken
    }

    this.client = axios.create({
      baseURL: this.clientUrl,
      url: workspaceUrl,
      headers: this.clientHeaders,
    })
  }

  public async getFiles<T>(options?: AxiosRequestConfig): Promise<FileResourceJSON[]> {
    return this.handleResponse(await this.client.get('/files', options))
  }

  public async getAllFiles<T>(): Promise<FileResourceJSON[]> {
    let res = await this.client.get('/files')
    let files: FileResourceJSON[] = this.handleResponse(res)
    while (res.data.next) {
      res = await this.client.get(res.data.next, { url: '' })
      files = files.concat(this.handleResponse(res))
    }

    return files
  }

  // public async create<Output>(
  //   resource: IRestResource,
  //   options: Partial<got.GotOptions> = {},
  // ): Promise<IRestResponse<Output>> {
  //   options.body = resource.toObject()
  //   return this.handleResponse(await this.client.post(resource.getResourcePath(), options))
  // }

  // public async update<Output>(
  //   resource: IRestResource,
  //   options: Partial<got.GotOptions> = {},
  // ): Promise<IRestResponse<Output>> {
  //   options.body = resource.toObject()
  //   return this.handleResponse(await this.client.patch(resource.getResourcePath(), options))
  // }

  public async saveFile<Output>(file, options: AxiosRequestConfig = {}): Promise<void> {
    try {
      await this.client.put('files/' + file.path, file, options)
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  // public async delete<T>(resource: IRestResource, options: Partial<got.GotOptions> = {}): Promise<IRestResponse<T>> {
  //   return this.handleResponse(await this.client.delete(resource.getResourcePath(), options))
  // }

  private handleResponse<T>(res: AxiosResponse): FileResourceJSON[] {
    if (!res.data) {
      console.log('malformed server reply')
      throw new Error()
    }
    return res.data.data
  }

  private handleError<T>(res: AxiosError): Error {
    console.log(err.toJSON())
    throw new Error()
  }
}
