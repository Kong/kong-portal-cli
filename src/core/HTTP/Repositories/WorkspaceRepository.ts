import RestClient from '../RestClient';
import WorkspacesCollection, { WorkspacesCollectionJSON } from '../Collections/WorkspacesCollection';
import WorkspaceResource, { WorkspaceResourceJSON } from '../Resources/WorkspaceResource';

export default class WorkspaceRepository {
  private path: string;
  private client: RestClient;

  public constructor(client: RestClient) {
    this.path = '/workspaces';
    this.client = client;
  }

  public async getWorkspaces(): Promise<WorkspacesCollection> {
    try {
      let response = await this.client.get<WorkspacesCollectionJSON>(this.path);
      let collection = WorkspacesCollection.fromJSON(response.result);

      collection.client = this.client;

      if (collection.workspaces) {
        collection.workspaces.forEach((file: WorkspaceResource): void => {
          file.client = this.client;
        });
      }

      return collection;
    } catch (e) {
      throw e;
    }
  }

  public async getWorkspace(path: string): Promise<WorkspaceResource> {
    let response = await this.client.get<WorkspaceResourceJSON>("workspaces/" + path);
    let resource = WorkspaceResource.fromJSON(response.result);
    // resource.client = this.client;
    return resource;
  }
}
