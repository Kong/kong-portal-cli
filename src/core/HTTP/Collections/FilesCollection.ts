import FileResource from '../Resources/FileResource';
import RestCollection from '../RestCollection';

export interface FilesCollectionJSON {
  data: [];
  next: string | null;
}

export interface IFilesCollection {
  data?: FileResource[];
  files?: FileResource[];
  next: string | null;
}

export default class FilesCollection extends RestCollection {
  public files: FileResource[];
  public next: string | null;

  public constructor(json: IFilesCollection) {
    super('/files');

    this.files = json.data || json.files || [];
    this.next = json.next;
  }

  public async getNext(): Promise<FilesCollection | void> {
    return super.getNext(this.next, FilesCollection);
  }

  public static fromJSON(json: FilesCollectionJSON): FilesCollection {
    return RestCollection.fromJSON(FilesCollection, FileResource, json) as FilesCollection;
  }
}
