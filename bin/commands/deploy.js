"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clipanion_1 = require("clipanion");
const chokidar = require("chokidar");
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
    client = new RestClient_1.default(workspace.config);
    repository = new FileRepository_1.default(client);
    let collection = await repository.getFiles();
    let portalConfigPath = workspace.portalConfig.path.replace(workspace.path + '/', '');
    let portalConfigResource = new FileResource_1.default({
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
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    let themes = await workspace.getThemes();
    let theme;
    for (theme of themes) {
        let themeConfigPath = theme.config.path.replace(workspace.path + '/', '');
        let themeConfigResource = new FileResource_1.default({
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
                }
                catch (e) {
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
                }
                catch (e) {
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
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
    }
    console.log('Done.');
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
