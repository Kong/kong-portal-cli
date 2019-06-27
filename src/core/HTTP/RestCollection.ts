import { IRestCollection, IRestResponse } from './RestInterfaces';
import { join } from 'path';
import RestClient from './RestClient';

export default class RestCollection implements IRestCollection {
  public resourcePath: string;
  public client?: RestClient;
  public next?: string | null;

  public constructor(resourcePath: string) {
    this.resourcePath = resourcePath;
  }

  public async save<T>(entity: any, options?: any): Promise<IRestResponse<any> | void> {
    if (this.client) {
      return await this.client.save<T>(entity, options);
    }

    return console.log('no rest client passed');
  }

  public async delete(entity: any, options?: any): Promise<IRestResponse<any> | void> {
    if (this.client) {
      return await this.client.delete<any>(entity, options);
    }

    return console.log('no rest client passed');
  }

  public async getNext(next: string | null, entity?: any): Promise<any | void> {
    if (!next) {
      return;
    }

    if (this.client) {
      let response = await this.client.get<any>(next);
      return entity.fromJSON(response.result);
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

  public getResourcePath(path: string = ''): string {
    return join(this.resourcePath, path);
  }

  public static fromJSON(entity: any, children: any, json: any): any {
    if (json.data) {
      json.data = json.data.map((element: any): any => {
        return children.fromJSON(element);
      });
    }

    return new entity(json);
  }
}
