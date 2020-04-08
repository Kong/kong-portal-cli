import Config from './Config'
import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'

export default class WorkspaceRouterConfig extends Config {
  public async load(): Promise<void> {
    try {
      const content = await fs.readFile(this.path, this.encoding)
      this.data = yaml.safeLoad(content)
    } catch {
      this.data = null
    }
  }
}
