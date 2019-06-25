import * as got from 'got';

import { IWorkspaceConfig } from '../WorkspaceConfig';
import { OutgoingHttpHeaders, IRestResponse, IRestResource } from './RestInterfaces';

export class RestClientError<T> extends Error {
  response: IRestResponse<T>;

  constructor(res: IRestResponse<T>, message?: string) {
    super(message);
    this.response = res;
  }
}

export default class RestClient {
  public client: got.GotInstance<got.GotJSONFn>;
  public clientHeaders: OutgoingHttpHeaders;
  public clientUrl: string;

  constructor(workspaceConfig: IWorkspaceConfig) {
    this.clientHeaders = workspaceConfig.headers || {};
    this.clientUrl = workspaceConfig.upstream;

    if (workspaceConfig.rbacToken) {
      this.clientHeaders['Kong-Admin-Token'] = workspaceConfig.rbacToken;
    }

    this.client = got.extend({
      baseUrl: this.clientUrl,
      headers: this.clientHeaders,
      json: true,
    });
  }

  public async get<T>(
    resource: string, 
    options: Partial<got.GotJSONOptions> = {},
  ): Promise<IRestResponse<T>> {
    return this.handleResponse(await this.client.get(resource, options));
  }

  public async create<Output>(
    resource: IRestResource, 
    options: Partial<got.GotJSONOptions> = {},
  ): Promise<IRestResponse<Output>> {
    options.body = resource.toObject()
    return this.handleResponse(await this.client.post(resource.getResourcePath(), options))
  }

  public async update<Output>(
    resource: IRestResource, 
    options: Partial<got.GotJSONOptions> = {},
  ): Promise<IRestResponse<Output>> {
    options.body = resource.toObject()
    return this.handleResponse(await this.client.patch(resource.getResourcePath(), options))
  }

  public async save<Output>(
    resource: IRestResource, 
    options: Partial<got.GotJSONOptions> = {},
  ): Promise<IRestResponse<Output>> {
    options.body = resource.toObject()
    return this.handleResponse(await this.client.put(resource.getResourcePath(), options))
  }

  public async delete<T>(
    resource: IRestResource, 
    options: Partial<got.GotJSONOptions> = {},
  ): Promise<IRestResponse<T>> {
    return this.handleResponse(await this.client.delete(resource.getResourcePath(), options))
  }

  private handleResponse<T>(res: any): IRestResponse<T> {
    let statusCode: number = res.statusCode || 500;
    let result: any = res.body;

    if (statusCode > 399) {
      throw new RestClientError<T>({
        statusCode,
        result,
        headers: res.headers,
      });
    }

    const response: IRestResponse<T> = {
      statusCode,
      result,
      headers: res.headers,
    }

    return response
  }
}
