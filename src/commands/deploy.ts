import { UsageError } from 'clipanion';
import { join } from 'path';

import Workspace from '../core/Workspace';
import RestClient from '../core/HTTP/RestClient';
import FilesRepository from '../core/HTTP/Repositories/FileRepository';
import FileResource from '../core/HTTP/Resources/FileResource';
import WorkspaceTheme from '../core/WorkspaceTheme';

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

  let portalConfigPath: string = workspace.portalConfig.path.replace(workspace.path + '/', '');
  let portalConfigResource = new FileResource({
    path: portalConfigPath,
    contents: workspace.portalConfig.dump(),
  });

  client.save(portalConfigResource, {
    body: portalConfigResource.toObject(),
  });

  console.log(`\tUploaded ${portalConfigPath}`);

  let contents = await workspace.getContent();
  if (contents.files) {
    for (let content of contents.files) {
      let resource = content.resource;

      try {
        resource.contents = await content.file.read();
        await collection.save(resource);
        console.log(`\tUploaded ${resource.path}`);
      } catch (e) {
        console.log(e);
      }
    }
  }

  let themes = await workspace.getThemes();
  let theme: WorkspaceTheme;
  for (theme of themes) {
    let themeConfigPath = theme.config.path.replace(workspace.path + '/', '');
    let themeConfigResource = new FileResource({
      path: themeConfigPath,
      contents: theme.config.dump(),
    });

    client.save(themeConfigResource, {
      body: themeConfigResource.toObject(),
    });

    console.log(`\tUploaded ${themeConfigPath}`);

    if (theme.assets) {
      for (let content of theme.assets) {
        let resource = content.resource;

        try {
          resource.contents = await content.file.read();
          await collection.save(resource);
          console.log(`\tUploaded ${resource.path}`);
        } catch (e) {
          console.log(e);
        }
      }
    }

    if (theme.layouts) {
      for (let content of theme.layouts) {
        let resource = content.resource;

        try {
          resource.contents = await content.file.read();
          await collection.save(resource);
          console.log(`\tUploaded ${resource.path}`);
        } catch (e) {
          console.log(e);
        }
      }
    }

    if (theme.partials) {
      for (let content of theme.partials) {
        let resource = content.resource;

        try {
          resource.contents = await content.file.read();
          await collection.save(resource);
          console.log(`\tUploaded ${resource.path}`);
        } catch (e) {
          console.log(e);
        }
      }
    }
  }

  console.log('Done.');
};
