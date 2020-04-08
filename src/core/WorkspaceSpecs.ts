import * as rs from 'recursive-readdir-async'
import * as fs from 'fs-extra'
import { join, toUnix } from 'upath'
import File from './File'
import FileResource from './HTTP/Resources/FileResource'

// todo: move out and rename, used in WorkspaceTheme.ts as well
export interface Spec {
  file: File
  resource: FileResource
}

export default class WorkspaceSpecs {
  public location: string
  public path: string
  public files: Spec[] | null

  public constructor(location: string) {
    this.location = location
    this.path = join(location, 'specs')

    this.files = null
  }

  public async scan(): Promise<void> {
    this.files = await rs.list(this.path, { exclude: ['.DS_Store'] })

    if (this.files) {
      this.files = this.files.map(
        (file: any): Spec => {
          const unixName = toUnix(file.fullname)
          return {
            file: new File(unixName),
            resource: new FileResource({
              path: unixName.replace(`${this.location}/`, ''),
              contents: '',
            }),
          }
        },
      )
    }
  }

  public async addContent(): Promise<void> {
    console.log('not yet implemented')
  }

  public outputStatsToConsole(): void {
    const contentLength: number = this.files ? this.files.length : 0

    console.log('')
    console.log('Total Specs:', contentLength)
  }

  public static async init(location: string): Promise<WorkspaceSpecs> {
    const content = new WorkspaceSpecs(location)
    await content.scan()
    return content
  }

  public static async exists(location: string): Promise<boolean> {
    try {
      const stat = await fs.lstat(WorkspaceSpecs.getDirectoryPath(location))
      return stat && stat.isDirectory()
    } catch (e) {
      return false
    }
  }

  public static getDirectoryPath(location: string): string {
    return join(location, 'specs')
  }
}
