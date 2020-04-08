import WorkspaceResource from '../Resources/WorkspaceResource'
import RestCollection from '../RestCollection'

export interface WorkspacesCollectionJSON {
  data: []
  next: string | null
}

export interface IWorkspacesCollection {
  data?: WorkspaceResource[]
  files?: WorkspaceResource[]
  next: string | null
}

export default class WorkspacesCollection extends RestCollection {
  public workspaces: WorkspaceResource[]
  public next: string | null

  public constructor(json: IWorkspacesCollection) {
    super('/workspaces')

    this.workspaces = json.data || json.files || []
    this.next = json.next
  }

  public async getNext(): Promise<WorkspacesCollection | void> {
    return super.getNext(this.next, WorkspacesCollection)
  }

  public static fromJSON(json: WorkspacesCollectionJSON): WorkspacesCollection {
    return RestCollection.fromJSON(WorkspacesCollection, WorkspaceResource, json) as WorkspacesCollection
  }
}
