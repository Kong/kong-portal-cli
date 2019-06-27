import * as fs from 'fs-extra';
import * as crypto from 'crypto-promise';

export default class File {
  public location: string;
  public encoding: string;

  public constructor(
    location: string,
    options = {
      encoding: 'utf8',
    },
  ) {
    this.location = location;
    this.encoding = options.encoding || 'utf8';
  }

  public async write(contents: string): Promise<void> {
    return await fs.outputFile(this.location, contents, this.encoding);
  }

  public async read(): Promise<string> {
    return await fs.readFile(this.location, this.encoding);
  }

  public async exists(): Promise<boolean> {
    return await fs.exists(this.location);
  }

  public async getShaSum(algorithm = '256'): Promise<string> {
    const contents: string = await this.read();
    const buffer: Buffer = await crypto.hash('sha' + algorithm)(contents);
    return buffer.toString('hex');
  }
}
