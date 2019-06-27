import { UsageError } from 'clipanion';
import { join } from 'path';

import Workspace from '../core/Workspace';
import RestClient from '../core/HTTP/RestClient';
import FilesRepository from '../core/HTTP/Repositories/FileRepository';
import FileResource from '../core/HTTP/Resources/FileResource';
import { Content } from '../core/WorkspaceContent';

function MissingWorkspaceError(name: string): void {
  const message: string[] = [
    `No workspace named "${name}" was found.`,
    ``,
    `Directories scanned:`,
    `\t${Workspace.getDirectoryPath(name)}`,
  ];

  throw new UsageError(message.join('\n'));
}

export default async (args): Promise<void> => {
  let workspace: Workspace;
  let client: RestClient;
  let repository: FilesRepository;

  try {
    workspace = await Workspace.init(args.workspace);
  } catch (e) {
    return MissingWorkspaceError(args.workspace);
  }

  client = new RestClient(workspace.config);
  repository = new FilesRepository(client);

  let collection = await repository.getFiles();
  if (collection.files) {
    let resource: FileResource;
    for (resource of collection.files) {
      await resource.delete();
      console.log(`\tDeleted ${resource.path}`);
    }
  }

  console.log('Done.');
};
