import { UsageError } from 'clipanion';
import * as chokidar from 'chokidar';
import * as ora from 'ora';
import * as chalk from 'chalk';

import Workspace from '../core/Workspace';
import RestClient from '../core/HTTP/RestClient';
import FilesRepository from '../core/HTTP/Repositories/FileRepository';
import FileResource from '../core/HTTP/Resources/FileResource';
import WorkspaceTheme from '../core/WorkspaceTheme';
import FilesCollection from '../core/HTTP/Collections/FilesCollection';

function MissingWorkspaceError(name: string): void {
  const message: string[] = [
    `No workspace named "${name}" was found.`,
    ``,
    `Directories scanned:`,
    `\t${Workspace.getDirectoryPath(name)}`,
  ];

  throw new UsageError(message.join('\n'));
}

async function Deploy(workspace: Workspace): Promise<void> {
  let client: RestClient;
  let repository: FilesRepository;
  let collection: FilesCollection;
  let spinner: ora.Ora;

  client = new RestClient(workspace.config);
  repository = new FilesRepository(client);
  collection = await repository.getFiles();

  console.log(`Deploying ${workspace.name}:`);
  console.log(``);

  spinner = ora({
    prefixText: `Deploying configuration...`,
    text: workspace.portalConfig.path,
  });
  spinner.start();

  try {
    let portalConfigPath: string = workspace.portalConfig.path.replace(workspace.path + '/', '');
    let portalConfigResource = new FileResource({
      path: portalConfigPath,
      contents: workspace.portalConfig.dump(),
    });

    await client.save(portalConfigResource, {
      body: portalConfigResource.toObject(),
    });
  } catch (e) {
    spinner.fail(e.message);
  }

  spinner.prefixText = `\t`;
  spinner.text = 'Deploy configuration';
  spinner.succeed();

  spinner = ora({
    prefixText: `Deploying content...`,
    text: `reading files...`,
  });
  spinner.start();
  try {
    let contents = await workspace.getContent();
    if (contents.files) {
      for (let content of contents.files) {
        spinner.text = content.file.location;
        content.resource.contents = await content.file.read();
        await collection.save(content.resource);
      }
    }
  } catch (e) {
    spinner.fail(e.message);
  }

  spinner.prefixText = `\t`;
  spinner.text = 'Deploy content';
  spinner.succeed();

  spinner = ora({
    prefixText: `Deploying themes...`,
    text: `reading files...`,
  });
  spinner.start();

  let themes = await workspace.getThemes();
  let theme: WorkspaceTheme;
  for (theme of themes) {
    try {
      spinner.text = workspace.portalConfig.path;
      let themeConfigPath = theme.config.path.replace(workspace.path + '/', '');
      let themeConfigResource = new FileResource({
        path: themeConfigPath,
        contents: theme.config.dump(),
      });

      await client.save(themeConfigResource, {
        body: themeConfigResource.toObject(),
      });
    } catch (e) {
      spinner.fail(e.message);
    }

    if (theme.assets) {
      for (let content of theme.assets) {
        try {
          let resource = content.resource;
          spinner.text = content.file.location;
          resource.contents = await content.file.read();
          await collection.save(resource);
        } catch (e) {
          spinner.fail(e.message);
          console.log(e);
        }
      }
    }

    if (theme.layouts) {
      for (let content of theme.layouts) {
        try {
          let resource = content.resource;
          spinner.text = content.file.location;
          resource.contents = await content.file.read();
          await collection.save(resource);
        } catch (e) {
          spinner.fail(e.message);
          console.log(e);
        }
      }
    }

    if (theme.partials) {
      for (let content of theme.partials) {
        try {
          let resource = content.resource;
          spinner.text = content.file.location;
          resource.contents = await content.file.read();
          await collection.save(resource);
        } catch (e) {
          spinner.fail(e.message);
          console.log(e);
        }
      }
    }
  }

  spinner.prefixText = `\t`;
  spinner.text = 'Deploy themes';
  spinner.succeed();
}

export default async (args: any): Promise<void> => {
  let workspace: Workspace;

  try {
    workspace = await Workspace.init(args.workspace);
  } catch (e) {
    return MissingWorkspaceError(args.workspace);
  }

  if (args.watch) {
    console.log(`Watching`, `${workspace.path}/*`);
    console.log(``);

    let watcher: any = chokidar.watch('.', {
      cwd: workspace.path,
      alwaysStat: true,
    });

    // Todo: only deploy changed files
    watcher.on('change', (path, stats): void => {
      if (stats && stats.isFile()) {
        Deploy(workspace);
      }
    });
  } else {
    Deploy(workspace);
  }
};
