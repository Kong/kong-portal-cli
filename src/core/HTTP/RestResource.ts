import { IRestResource, IRestResponse } from './RestInterfaces';
import { join } from 'upath';
import RestClient from './RestClient';

export default class RestResource implements IRestResource {
  public resourcePath: string;
  public client?: RestClient;

  public constructor(resourcePath: string) {
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
    let o = Object.assign({}, this);
    delete o.resourcePath;
    return o;
  }

  public toJSON(): string {
    return this.toObject();
  }

  public getResourcePath(path: string): string {
    return join(this.resourcePath, path);
  }

  public static fromJSON(child: any, json: any): any {
    return new child(json);
  }
}
