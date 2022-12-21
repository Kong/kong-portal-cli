export interface FileResourceJSON {
  /** UUID */
  id?: string
  /** File path from workspace root */
  path?: string
  /** Raw file content */
  contents?: string
  /** File creation date */
  created_at?: number
  /** Sha256 Checksum */
  checksum?: string
  /** @deprecated since 0.36 */
  auth?: boolean
}

export default class FileResource implements FileResourceJSON {
  public id?: string
  public path?: string
  public contents?: string
  public checksum?: string
  public created_at?: number
  public auth?: boolean

  public constructor(json: FileResourceJSON) {
    this.id = json.id
    this.path = json.path
    this.contents = json.contents
    this.created_at = json.created_at
    this.checksum = json.checksum
    this.auth = json.auth
  }
}
