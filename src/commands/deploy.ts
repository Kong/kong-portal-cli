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
    `Scanned directories for workspace configurations:`,
    `\t${Workspace.getDirectoryPath(name)}`,
  ];

  throw new UsageError(message.join('\n'));
}

async function DeployWorkspaceConfig(workspace: Workspace, client: RestClient, path?: any): Promise<void> {
  if (path && path !== workspace.portalConfig.path) {
    return;
  }

  let spinner: ora.Ora = ora({
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

    spinner.prefixText = `\t`;
    spinner.text = 'Deploy configuration';
    spinner.succeed();
  } catch (e) {
    spinner.fail(e.message);
  }
}

async function DeployWorkspaceRouter(workspace: Workspace, client: RestClient, path: any): Promise<void> {
  if (!workspace.routerConfig.data) {
    return;
  }

  if (path && workspace.routerConfig.path.split(path)[1] !== '') {
    return;
  }

  let spinner: ora.Ora = ora({
    prefixText: `Deploying router...`,
    text: workspace.routerConfig.path,
  });

  spinner.start();

  try {
    let routerConfigPath: string = workspace.routerConfig.path.replace(workspace.path + '/', '');
    let routerConfigResource = new FileResource({
      path: routerConfigPath,
      contents: workspace.routerConfig.dump(),
    });

    await client.save(routerConfigResource, {
      body: routerConfigResource.toObject(),
    });

    spinner.prefixText = `\t`;
    spinner.text = 'Deploy router';
    spinner.succeed();
  } catch (e) {
    spinner.fail(e.message);
  }
}

async function DeployWorkspaceContent(
  workspace: Workspace,
  client: RestClient,
  collection: FilesCollection,
  path: any,
): Promise<void> {
  if (path && path.indexOf('content') < 0) {
    return;
  }

  let spinner = ora({
    prefixText: `Deploying ${path || 'content'}...`,
    text: `reading files...`,
  });

  spinner.start();

  try {
    let contents = await workspace.getContent();
    if (contents.files) {
      for (let content of contents.files) {
        if (path && content.file.location.split(path)[1] !== '') {
          continue;
        }

        spinner.text = content.file.location;
        content.resource.contents = await content.file.read();
        await collection.save(content.resource);
      }
    }

    spinner.prefixText = `\t`;
    spinner.text = `Deploy ${path || 'content'}`;
    spinner.succeed();
  } catch (e) {
    spinner.fail(e.message);
  }
}

async function DeployWorkspaceThemeConfig(workspace, theme, client, spinner, path): Promise<void> {
  if (path && theme.config.path.split(path)[1] !== '') {
    return;
  }

  try {
    spinner.text = theme.config.path;

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
}

async function DeployWorkspaceThemeFolder(folder, collection, spinner, path): Promise<void> {
  try {
    if (folder) {
      for (let content of folder) {
        if (path && content.file.location.split(path)[1] !== '') {
          continue;
        }

        let resource = content.resource;
        spinner.text = content.file.location;
        resource.contents = await content.file.read();
        await collection.save(resource);
      }
    }
  } catch (e) {
    spinner.fail(e.message);
    console.log(e);
  }
}

async function DeployWorkspaceThemes(
  workspace: Workspace,
  client: RestClient,
  collection: FilesCollection,
  path: any,
): Promise<void> {
  if (path && path.indexOf('themes') < 0) {
    return;
  }

  let spinner = ora({
    prefixText: `Deploying ${path || 'themes'}...`,
    text: `reading files...`,
  });

  spinner.start();

  let themes = await workspace.getThemes();
  let theme: WorkspaceTheme;
  for (theme of themes) {
    await DeployWorkspaceThemeConfig(workspace, theme, client, spinner, path);
    await DeployWorkspaceThemeFolder(theme.assets, collection, spinner, path);
    await DeployWorkspaceThemeFolder(theme.layouts, collection, spinner, path);
    await DeployWorkspaceThemeFolder(theme.partials, collection, spinner, path);
  }

  spinner.prefixText = `\t`;
  spinner.text = `Deploy ${path || 'themes'}`;
  spinner.succeed();
}

async function Deploy(workspace: Workspace, path?: any): Promise<void> {
  let client: RestClient;
  let repository: FilesRepository;
  let collection: FilesCollection;

  try {
    client = new RestClient(workspace.config);
    repository = new FilesRepository(client);
    collection = await repository.getFiles();

    console.log(`Deploying ${workspace.name}:`);
    console.log(``);

    await DeployWorkspaceConfig(workspace, client, path);
    await DeployWorkspaceRouter(workspace, client, path);
    await DeployWorkspaceContent(workspace, client, collection, path);
    await DeployWorkspaceThemes(workspace, client, collection, path);

    console.log(``);
  } catch (e) {
    console.log(e.url, e.message);
  }
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

    watcher.on('change', (path, stats): void => {
      if (stats && stats.isFile()) {
        Deploy(workspace, path);
      }
    });
  } else {
    Deploy(workspace);
  }
};
