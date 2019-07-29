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
        `Directories scanned:`,
        `\t${Workspace_1.default.getDirectoryPath(name)}`,
    ];
    throw new clipanion_1.UsageError(message.join('\n'));
}
async function Deploy(workspace) {
    let client;
    let repository;
    let collection;
    let spinner;
    client = new RestClient_1.default(workspace.config);
    repository = new FileRepository_1.default(client);
    collection = await repository.getFiles();
    console.log(`Deploying ${workspace.name}:`);
    console.log(``);
    spinner = ora({
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
    }
    catch (e) {
        spinner.fail(e.message);
    }
    if (workspace.routerConfig.data) {
        try {
            let routerConfigPath = workspace.routerConfig.path.replace(workspace.path + '/', '');
            let routerConfigResource = new FileResource_1.default({
                path: routerConfigPath,
                contents: workspace.routerConfig.dump(),
            });
            console.log('\n');
            console.log(routerConfigResource.toObject());
            await client.save(routerConfigResource, {
                body: routerConfigResource.toObject(),
            });
        }
        catch (e) {
            spinner.fail(e.message);
        }
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
    }
    catch (e) {
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
    let theme;
    for (theme of themes) {
        try {
            spinner.text = workspace.portalConfig.path;
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
        if (theme.assets) {
            for (let content of theme.assets) {
                try {
                    let resource = content.resource;
                    spinner.text = content.file.location;
                    resource.contents = await content.file.read();
                    await collection.save(resource);
                }
                catch (e) {
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
                }
                catch (e) {
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
                }
                catch (e) {
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
                Deploy(workspace);
            }
        });
    }
    else {
        Deploy(workspace);
    }
};
