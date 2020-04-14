import * as fs from 'fs-extra'
import * as crypto from 'crypto-promise'
import { toUnix } from 'upath'
import FileResource from './HTTP/Resources/FileResource'

import { isBinaryFileSync } from 'isbinaryfile'

export default interface FileInterface {
  location: string
  encoding: string
}
export default class File implements FileInterface {
  public location: string
  public workspacePath: string
  public encoding: string
  public resource: FileResource

  public constructor(
    location: string,
    workspacePath: string,
    options = {
      encoding: 'utf8',
    },
  ) {
    this.location = toUnix(location)
    this.encoding = options.encoding || 'utf8'
    this.workspacePath = toUnix(workspacePath)
    this.resource = new FileResource({
      path: this.location.replace(`${this.workspacePath}/`, ''),
      contents: '',
    })
  }

  public async write(contents: string): Promise<void> {
    if (this.isBase64Asset() && contents.startsWith('data:')) {
      return await this.write64(contents)
    }
    return await fs.outputFile(this.location, contents, this.encoding)
  }

  public async read(): Promise<void> {
    if (this.isBase64Asset()) {
      this.resource.contents = await this.read64()
      return
    }
    this.resource.contents = await fs.readFile(this.location, this.encoding)
  }

  private async read64(): Promise<string> {
    let fileExtMatch = this.location.match(/\w+$/)
    let fileExt = 'unknown'
    if (fileExtMatch) {
      fileExt = fileExtMatch[0]
    }
    const encoded = await fs.readFile(this.location, { encoding: 'base64' })
    return `data:image/${fileExt};base64,${encoded}`
  }

  private async write64(contents: string): Promise<void> {
    contents = contents.split(';base64,')[1]
    return await fs.outputFile(this.location, Buffer.from(contents, 'base64'), this.encoding)
  }

  public async exists(): Promise<boolean> {
    return await fs.exists(this.location)
  }

  public async getShaSum(algorithm = '256'): Promise<string> {
    await this.read()

    const buffer: Buffer = await crypto.hash('sha' + algorithm)(this.resource.contents)
    return buffer.toString('hex')
  }

  public isBase64Path(): boolean {
    return /themes\/\w*\/assets\//.test(this.location)
  }

  public isBase64Asset(): boolean {
    return /themes\/\w*\/assets\//.test(this.location) && isBinaryFileSync(this.location)
  }
}
