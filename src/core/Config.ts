import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import { join } from 'upath'

export default class Config {
  public filename: string
  public location: string
  public path: string
  public encoding: string
  public data: any

  public constructor(
    location: string,
    filename: string,
    options = {
      encoding: 'utf8',
    },
  ) {
    this.filename = filename
    this.location = location
    this.path = join(location, filename)
    this.encoding = options.encoding || 'utf8'
    this.data = null
  }

  public async load(): Promise<void> {
    try {
      const content = await fs.readFile(this.path, this.encoding)
      this.data = yaml.safeLoad(content)
    } catch (e) {
      this.data = null
    }
  }

  public async save(): Promise<void> {
    const content = this.dump()
    return await fs.writeFile(this.path, content, this.encoding)
  }

  public dump(): string {
    return yaml.safeDump(this.data)
  }

  public toConsole(): void {
    if (this.data === null) {
      console.log('No Config')
      return
    }
    const lines = this.dump().split('\n')
    for (const line of lines) {
      console.log('  ', line)
    }
  }
}
