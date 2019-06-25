import {IRestResource, IRestResponse} from './RestInterfaces'
import {join} from 'path'
import RestClient from './RestClient';

export default class RestResource implements IRestResource {
  public resourcePath: string;
  public client?: RestClient;

  constructor(resourcePath: string) {
    this.resourcePath = resourcePath;
  }

  public async save<T>(options?: any): Promise<IRestResponse<any> | void> {
    if (this.client) {
      return await this.client.save<T>(this, options);
    }

    return console.log('no rest client passed');
  }

  public async delete(options?: any): Promise<IRestResponse<any> | void> {
    if (this.client) {
      return await this.client.delete<any>(this, options);
    }

    return console.log('no rest client passed');
  }

  public toObject(): any {
    return Object.assign({}, this)
  }

  public toJSON(): string {
    return this.toObject()
  }

  public getResourcePath(path: string): string {
    return join(this.resourcePath, path);
  }

  public static fromJSON(child: any, json: any): any {
    return Object.assign(Object.create(child.prototype), json)
  }
}