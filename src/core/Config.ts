import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import { join } from 'path';

export default class Config {
  public filename: string;
  public location: string;
  public path: string;
  public encoding: string;
  public data: any;

  public constructor(
    location: string,
    filename: string,
    options = {
      encoding: 'utf8',
    },
  ) {
    this.filename = filename;
    this.location = location;
    this.path = join(location, filename);
    this.encoding = options.encoding || 'utf8';
    this.data = null;
  }

  public async load(): Promise<void> {
    const content = await fs.readFile(this.path, this.encoding);
    this.data = yaml.safeLoad(content);
  }

  public async save(): Promise<void> {
    const content = yaml.safeDump(this.data);
    return await fs.writeFile(this.path, content, this.encoding);
  }

  public toConsole(): void {
    const lines = yaml.safeDump(this.data).split('\n');
    for (var line of lines) {
      console.log(`  `, line);
    }
  }
}
