export interface OutgoingHttpHeaders {
  [header: string]: number | string | string[] | undefined;
}

export interface IncomingHttpHeaders {
  [header: string]: string | string[] | undefined;
}

export interface IRestResponse<T> {
  statusCode: number,
  result: T,
  headers: IncomingHttpHeaders
}

export interface IRestResource {
  toObject(): any;
  toJSON(): string;
  getResourcePath(path?: string): string;
}

export interface IRestCollection {
  toObject(): any;
  toJSON(): string;
  getResourcePath(path?: string): string;
}
