import FileResource from '../Resources/FileResource'
import RestCollection from '../RestCollection'

export interface FilesCollectionJSON {
  data: []
  next: string | null
}

export interface IFilesCollection {
  data?: FileResource[]
  files?: FileResource[]
  next: string | null
}

export default class FilesCollection extends RestCollection {
  public files: FileResource[]
  public next: string | null

  public constructor(json: IFilesCollection) {
    super('/files')

    this.files = json.data || json.files || []
    this.next = json.next
  }

  public async getNext(): Promise<FilesCollection | void> {
    const nextRes: FilesCollection = await super.getNext(this.next, FilesCollection)
    if (!nextRes) {
      return
    }
    this.files = this.files.concat(nextRes.files)
    this.next = nextRes.next
    await this.getNext()
  }

  public static fromJSON(json: FilesCollectionJSON): FilesCollection {
    return RestCollection.fromJSON(FilesCollection, FileResource, json) as FilesCollection
  }
}
