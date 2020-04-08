import RestResource from '../RestResource'

export interface WorkspaceResourceJSON {
  /** UUID */
  id?: string
  /** File path from workspace root */
  name: string
  /** Workspace config */
  config: any
}

export default class WorkspaceResource extends RestResource implements WorkspaceResourceJSON {
  public id?: string
  public name: string
  public config: any

  public constructor(json: WorkspaceResourceJSON) {
    super('/workspaces')

    this.id = json.id
    this.name = json.name
    this.config = json.config
  }

  public getResourcePath(): string {
    return super.getResourcePath(this.id || this.name)
  }

  public static fromJSON(json: WorkspaceResourceJSON): WorkspaceResource {
    return RestResource.fromJSON(WorkspaceResource, json) as WorkspaceResource
  }
}
