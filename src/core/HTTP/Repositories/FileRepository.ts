import RestClient from '../RestClient';
import FilesCollection, { FilesCollectionJSON } from '../Collections/FilesCollection';
import FileResource, { FileResourceJSON } from '../Resources/FileResource';

export default class FilesRepository {
  private path: string;
  private client: RestClient;

  public constructor(client: RestClient) {
    this.path = '/files';
    this.client = client;
  }

  public async getFiles(): Promise<FilesCollection> {
    try {
      let response = await this.client.get<FilesCollectionJSON>(this.path);
      let collection = FilesCollection.fromJSON(response.result);

      collection.client = this.client;

      if (collection.files) {
        collection.files.forEach((file: FileResource): void => {
          file.client = this.client;
        });
      }

      return collection;
    } catch (e) {
      throw e;
    }
  }

  public async getFile(path: string): Promise<FileResource> {
    let response = await this.client.get<FileResourceJSON>(path);
    let resource = FileResource.fromJSON(response.result);
    resource.client = this.client;
    return resource;
  }
}
