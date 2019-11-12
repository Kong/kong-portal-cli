import { UsageError } from 'clipanion';
import { join } from 'upath';

import File from '../core/File';
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

  client = new RestClient(workspace.config, workspace.name);
  repository = new FilesRepository(client);


  console.log(`Config:`);
  console.log(``);
  console.log(`\t`,`Workspace:`, workspace.name);

  if (workspace.config.adminUrl) {
    console.log(`\t`,`Workspace Upstream:`, `${workspace.config.adminUrl}/${workspace.name}`, workspace.config.rbacToken ? `(authenticated)` : ``);
  } else if (workspace.config.upstream) {
    console.log(`\t`,`Workspace Upstream:`, `${workspace.config.upstream}`, workspace.config.rbacToken ? `(authenticated)` : ``);
  }

  console.log(`\t`,`Workspace Directory:`, workspace.path);
  console.log(``);
  console.log(`Changes:`);
  console.log(``);

  let collection = await repository.getFiles();
  let added = 0;
  let modified = 0;

  if (collection.files) {
    let resource: FileResource;
    for (resource of collection.files) {
      let path: string = join(workspace.path, resource.path);
      let file: File = new File(path);
      if (await file.exists()) {
        let shasum = await file.getShaSum();
        if (shasum !== resource.checksum) {
          await file.write(resource.contents);
          console.log(`\t`, `Modified:`, resource.path);
          modified += 1;
        }
      } else {
        await file.write(resource.contents);
        console.log(`\t`, 'Added:', resource.path);
        added += 1;
      }
    }
  }

  if (!modified || added) {
    console.log(`\t`, `No changes.`)
  }

  console.log(``);
  console.log('Done.');
};
