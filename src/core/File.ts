import * as fs from 'fs-extra';
import * as crypto from 'crypto-promise';

export default interface FileInterface {
  location: string;
  encoding: string;
}
export default class File implements FileInterface {
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

  public async read64(): Promise<string> {
    let fileExtMatch = this.location.match(/\w+$/);
    let fileExt = 'unknown';
    if (fileExtMatch) {
      fileExt = fileExtMatch[0];
    }
    const encoded = await fs.readFile(this.location, { encoding: 'base64' });
    return `data:image/${fileExt};base64,${encoded}`;
  }

  public async write64(contents: string): Promise<void> {
    contents = contents.split(';base64,')[1];
    return await fs.outputFile(this.location, Buffer.from(contents, 'base64'), this.encoding);
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
