import { IWorkspaceConfig } from '../WorkspaceConfig'
import { IGetAllFilesParams, IRestResponse } from './RestInterfaces'
import FileResource, { FileResourceJSON } from './Resources/FileResource'
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, AxiosInstance, AxiosRequestHeaders } from 'axios'
import { Agent as HTTPAgent } from 'http'
import { Agent as HTTPSAgent } from 'https'
import { MAX_CONTENT_LENGTH_MB, ONE_MB } from '../constants'

export class RestClientError<T> extends Error {
  public response: IRestResponse<T>

  public constructor(res: IRestResponse<T>, message?: string) {
    super(message)
    this.response = res
  }
}

export default class RestClient {
  public client: AxiosInstance
  public clientHeaders: AxiosRequestHeaders
  public clientUrl: string
  public workspaceName: string

  public constructor(workspaceConfig: IWorkspaceConfig, workspaceName: string) {
    this.clientHeaders = workspaceConfig.headers || {}
    this.workspaceName = workspaceName

    if (workspaceConfig.kongAdminUrl) {
      // workspaceUrl is removed when paginating, kong offset includes it.
      this.clientUrl = `${workspaceConfig.kongAdminUrl}`
    } else if (workspaceConfig.upstream) {
      console.log(
        'upstream is deprecated and will cease to function in a later release. Please use kong_admin_url (upstream url without the workspace suffix)',
      )
      const match = workspaceConfig.upstream.match(/.*\//)
      if (!match) {
        console.log('unable to parse upstream url')
        throw new Error()
      }
      this.clientUrl = match[0]
    } else {
      console.log('kongAdminUrl not set')
      throw new Error()
    }

    if (workspaceConfig.kongAdminToken) {
      this.clientHeaders['Kong-Admin-Token'] = workspaceConfig.kongAdminToken
    }

    let httpsAgent: HTTPSAgent

    if (workspaceConfig.disableSSLVerification) {
      httpsAgent = new HTTPSAgent({
        rejectUnauthorized: false,
        keepAlive: true,
      })
    } else {
      httpsAgent = new HTTPSAgent({
        keepAlive: true,
      })
    }

    this.client = axios.create({
      baseURL: this.clientUrl,
      headers: this.clientHeaders,
      httpAgent: new HTTPAgent({ keepAlive: true }),
      maxContentLength:
        (workspaceConfig.maxContentLengthInMb ? workspaceConfig.maxContentLengthInMb : MAX_CONTENT_LENGTH_MB) * ONE_MB,
      httpsAgent,
    })
  }

  public async getFiles<T>(options?: AxiosRequestConfig): Promise<FileResourceJSON[]> {
    return this.handleResponse(await this.client.get(`${this.workspaceName}/files`, options))
  }

  public async getAllFiles(params: IGetAllFilesParams = {}): Promise<FileResourceJSON[]> {
    let res = await this.client.get(`${this.workspaceName}/files`, {
      params,
    })
    let files: FileResourceJSON[] = this.handleResponse(res)
    while (res.data.next) {
      // url already has workspace and query params
      res = await this.client.get(res.data.next)
      files = files.concat(this.handleResponse(res))
    }

    return files
  }

  public async saveFile<Output>(file: FileResource, options: AxiosRequestConfig = {}): Promise<void> {
    try {
      await this.client.put(`${this.workspaceName}/files/${file.path}`, file, options)
    } catch (e) {
      console.log(`\n\nError uploading file: ${file.path}\n`)
      console.error((e.response && e.response.data) || e)
      throw e
    }
  }

  public async deleteFile<T>(file: FileResource, options: AxiosRequestConfig = {}): Promise<void> {
    try {
      await this.client.delete(`${this.workspaceName}/files/${file.path}`, options)
    } catch (e) {
      console.log(`\n\nError deleting file: ${file.path}\n`)
      console.error((e.response && e.response.data) || e)
      throw e
    }
  }

  public async enablePortal(options: AxiosRequestConfig = {}): Promise<void> {
    await this.client.patch(
      `${this.workspaceName}/workspaces/${this.workspaceName}`,
      { config: { portal: true } },
      options,
    )
  }

  public async disablePortal(options: AxiosRequestConfig = {}): Promise<void> {
    await this.client.patch(
      `${this.workspaceName}/workspaces/${this.workspaceName}`,
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

  public handleError<T>(err: AxiosError): string {
    if (err.message === 'Request body larger than maxBodyLength limit') {
      return '\nFiles must be less than 10mb'
    }
    if (err.response && err.response.status === 401) {
      return err.message + '\n\t Make sure you have the correct admin token and RBAC settings for that token'
    }
    if (err.response && err.response.status === 404) {
      return err.message + '\n\t Make sure Portal is enabled on this workspace: \n\t "portal enable <workspace>"'
    }
    return err.message
  }
}
