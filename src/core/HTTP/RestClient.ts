import { IWorkspaceConfig } from '../WorkspaceConfig'
import { OutgoingHttpHeaders, IRestResponse, IRestResource } from './RestInterfaces'
import FileResource, { FileResourceJSON } from './Resources/FileResource'
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
  public workspaceName: string

  public constructor(workspaceConfig: IWorkspaceConfig, workspaceName: string) {
    this.clientHeaders = workspaceConfig.headers || {}
    this.workspaceName = workspaceName

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
      // url is set to empty because next already has workspace
      res = await this.client.get(res.data.next, { url: '' })
      files = files.concat(this.handleResponse(res))
    }

    return files
  }

  public async saveFile<Output>(file: FileResource, options: AxiosRequestConfig = {}): Promise<void> {
    try {
      await this.client.put(`/files/${file.path}`, file, options)
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  public async deleteFile<T>(file: FileResource, options: AxiosRequestConfig = {}): Promise<void> {
    await this.client.delete(`/files/${file.path}`, options)
  }

  public async enablePortal(options: AxiosRequestConfig = {}): Promise<void> {
    await this.client.patch(
      `/${this.workspaceName}/workspaces/${this.workspaceName}`,
      { config: { portal: true } },
      options,
    )
  }

  public async disablePortal(options: AxiosRequestConfig = {}): Promise<void> {
    await this.client.patch(
      `/${this.workspaceName}/workspaces/${this.workspaceName}`,
      { config: { portal: false } },
      options,
    )
  }

  private handleResponse<T>(res: AxiosResponse): FileResourceJSON[] {
    if (!res.data) {
      console.log('malformed server reply')
      throw new Error()
    }
    return res.data.data
  }

  private handleError<T>(err: AxiosError): Error {
    console.log(err.toJSON())
    throw new Error()
  }
}
