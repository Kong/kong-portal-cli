import * as rs from 'recursive-readdir-async';
import * as fs from 'fs-extra';
import { join } from 'path';
import File from './File';
import FileResource from './HTTP/Resources/FileResource';

// todo: move out and rename, used in WorkspaceTheme.ts as well
export interface Content {
  file: File;
  resource: FileResource;
}

export default class WorkspaceContent {
  public location: string;
  public path: string;
  public files: Content[] | null;

  public constructor(location: string) {
    this.location = location;
    this.path = join(location, 'content');

    this.files = null;
  }

  public async scan(): Promise<void> {
    this.files = await rs.list(this.path);

    if (this.files) {
      this.files = this.files.map(
        (file: any): Content => {
          return {
            file: new File(file.fullname),
            resource: new FileResource({
              path: file.fullname.replace(`${this.location}/`, ''),
              contents: '',
            }),
          };
        },
      );
    }
  }

  public async addContent(): Promise<void> {
    console.log('not yet implemented');
  }

  public outputStatsToConsole(): void {
    const contentLength: number = this.files ? this.files.length : 0;

    console.log(``);
    console.log(`Total Content:`, contentLength);
  }

  public static async init(location: string): Promise<WorkspaceContent> {
    const content = new WorkspaceContent(location);
    await content.scan();
    return content;
  }

  public static async exists(location: string): Promise<boolean> {
    try {
      const stat = await fs.lstat(WorkspaceContent.getDirectoryPath(location));
      return stat && stat.isDirectory();
    } catch (e) {
      return false;
    }
  }

  public static getDirectoryPath(location: string): string {
    return join(location, 'content');
  }
}
