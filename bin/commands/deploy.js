"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clipanion_1 = require("clipanion");
const chokidar = require("chokidar");
const ora = require("ora");
const Workspace_1 = require("../core/Workspace");
const RestClient_1 = require("../core/HTTP/RestClient");
const FileRepository_1 = require("../core/HTTP/Repositories/FileRepository");
const FileResource_1 = require("../core/HTTP/Resources/FileResource");
function MissingWorkspaceError(name) {
    const message = [
        `No workspace named "${name}" was found.`,
        ``,
        `Scanned directories for workspace configurations:`,
        `\t${Workspace_1.default.getDirectoryPath(name)}`,
    ];
    throw new clipanion_1.UsageError(message.join('\n'));
}
async function DeployWorkspaceConfig(workspace, client, path) {
    if (path && workspace.portalConfig.path.split(path)[1] !== '') {
        return;
    }
    let spinner = ora({
        prefixText: `Deploying configuration...`,
        text: workspace.portalConfig.path,
    });
    spinner.start();
    try {
        let portalConfigPath = workspace.portalConfig.path.replace(workspace.path + '/', '');
        let portalConfigResource = new FileResource_1.default({
            path: portalConfigPath,
            contents: workspace.portalConfig.dump(),
        });
        await client.save(portalConfigResource, {
            body: portalConfigResource.toObject(),
        });
        spinner.prefixText = `\t`;
        spinner.text = 'Deploy configuration';
        spinner.succeed();
    }
    catch (e) {
        spinner.fail(e.message);
    }
}
async function DeployWorkspaceRouter(workspace, client, path) {
    if (!workspace.routerConfig.data) {
        return;
    }
    if (path && workspace.routerConfig.path.split(path)[1] !== '') {
        return;
    }
    let spinner = ora({
        prefixText: `Deploying router...`,
        text: workspace.routerConfig.path,
    });
    spinner.start();
    try {
        let routerConfigPath = workspace.routerConfig.path.replace(workspace.path + '/', '');
        let routerConfigResource = new FileResource_1.default({
            path: routerConfigPath,
            contents: workspace.routerConfig.dump(),
        });
        await client.save(routerConfigResource, {
            body: routerConfigResource.toObject(),
        });
        spinner.prefixText = `\t`;
        spinner.text = 'Deploy router';
        spinner.succeed();
    }
    catch (e) {
        spinner.fail(e.message);
    }
}
async function DeployWorkspaceContent(workspace, client, collection, path) {
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
    }
    catch (e) {
        spinner.fail(e.message);
    }
}
async function DeployWorkspaceEmails(workspace, client, collection, path) {
    if (path && path.indexOf('emails') < 0) {
        return;
    }
    let spinner = ora({
        prefixText: `Deploying ${path || 'emails'}...`,
        text: `reading files...`,
    });
    spinner.start();
    try {
        let contents = await workspace.getEmails();
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
        spinner.text = `Deploy ${path || 'email'}`;
        spinner.succeed();
    }
    catch (e) {
        spinner.fail(e.message);
    }
}
async function DeployWorkspaceSpecs(workspace, client, collection, path) {
    if (path && path.indexOf('specs') < 0) {
        return;
    }
    let spinner = ora({
        prefixText: `Deploying ${path || 'specs'}...`,
        text: `reading files...`,
    });
    spinner.start();
    try {
        let specs = await workspace.getSpecs();
        if (specs.files) {
            for (let spec of specs.files) {
                if (path && spec.file.location.split(path)[1] !== '') {
                    continue;
                }
                spinner.text = spec.file.location;
                spec.resource.contents = await spec.file.read();
                await collection.save(spec.resource);
            }
        }
        spinner.prefixText = `\t`;
        spinner.text = `Deploy ${path || 'specs'}`;
        spinner.succeed();
    }
    catch (e) {
        spinner.fail(e.message);
    }
}
async function DeployWorkspaceThemeConfig(workspace, theme, client, spinner, path) {
    if (path && theme.config.path.split(path)[1] !== '') {
        return;
    }
    try {
        spinner.text = theme.config.path;
        let themeConfigPath = theme.config.path.replace(workspace.path + '/', '');
        let themeConfigResource = new FileResource_1.default({
            path: themeConfigPath,
            contents: theme.config.dump(),
        });
        await client.save(themeConfigResource, {
            body: themeConfigResource.toObject(),
        });
    }
    catch (e) {
        spinner.fail(e.message);
    }
}
async function DeployWorkspaceThemeFolder(folder, collection, spinner, path) {
    try {
        if (folder) {
            for (let content of folder) {
                if (path && content.file.location.split(path)[1] !== '') {
                    continue;
                }
                let resource = content.resource;
                spinner.text = content.file.location;
                resource.contents = await content.file.read();
                let fileExt = content.file.location.split('.').pop().toLowerCase();
                if (content.file.location.includes('assets') &&
                    ['jpeg', 'jpg', 'png', 'ico'].includes(fileExt) &&
                    !resource.contents.startsWith('data')) {
                    const encoded = await content.file.read64();
                    resource.contents = `data:image/${fileExt};base64,${encoded}`;
                    console.log('base64', resource.contents);
                }
                await collection.save(resource);
            }
        }
    }
    catch (e) {
        spinner.fail(e.message);
        console.log(e);
    }
}
async function DeployWorkspaceThemes(workspace, client, collection, path) {
    if (path && path.indexOf('themes') < 0) {
        return;
    }
    let spinner = ora({
        prefixText: `Deploying ${path || 'themes'}...`,
        text: `reading files...`,
    });
    spinner.start();
    let themes = await workspace.getThemes();
    let theme;
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
async function Deploy(workspace, path) {
    let client;
    let repository;
    let collection;
    try {
        client = new RestClient_1.default(workspace.config, workspace.name);
        repository = new FileRepository_1.default(client);
        collection = await repository.getFiles();
        console.log(`Deploying ${workspace.name}:`);
        console.log(``);
        await DeployWorkspaceConfig(workspace, client, path);
        await DeployWorkspaceRouter(workspace, client, path);
        await DeployWorkspaceContent(workspace, client, collection, path);
        await DeployWorkspaceEmails(workspace, client, collection, path);
        await DeployWorkspaceSpecs(workspace, client, collection, path);
        await DeployWorkspaceThemes(workspace, client, collection, path);
        console.log(``);
    }
    catch (e) {
        console.log(e.url, e.message);
    }
}
exports.default = async (args) => {
    let workspace;
    try {
        workspace = await Workspace_1.default.init(args.workspace);
    }
    catch (e) {
        return MissingWorkspaceError(args.workspace);
    }
    if (args.watch) {
        console.log(`Watching`, `${workspace.path}/*`);
        console.log(``);
        let watcher = chokidar.watch('.', {
            cwd: workspace.path,
            alwaysStat: true,
        });
        watcher.on('change', (path, stats) => {
            if (stats && stats.isFile()) {
                Deploy(workspace, path);
            }
        });
    }
    else {
        Deploy(workspace);
    }
};
