"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clipanion_1 = require("clipanion");
const upath_1 = require("upath");
const File_1 = require("../core/File");
const Workspace_1 = require("../core/Workspace");
const RestClient_1 = require("../core/HTTP/RestClient");
const FileRepository_1 = require("../core/HTTP/Repositories/FileRepository");
function MissingWorkspaceError(name) {
    const message = [
        `No workspace named "${name}" was found.`,
        ``,
        `Directories scanned:`,
        `\t${Workspace_1.default.getDirectoryPath(name)}`,
    ];
    throw new clipanion_1.UsageError(message.join('\n'));
}
exports.default = async (args) => {
    let workspace;
    let client;
    let repository;
    try {
        workspace = await Workspace_1.default.init(args.workspace);
    }
    catch (e) {
        return MissingWorkspaceError(args.workspace);
    }
    client = new RestClient_1.default(workspace.config);
    repository = new FileRepository_1.default(client);
    console.log(`Config:`);
    console.log(``);
    console.log(`\t`, `Workspace:`, workspace.name);
    console.log(`\t`, `Workspace Upstream:`, workspace.config.upstream, workspace.config.rbacToken ? `(authenticated)` : ``);
    console.log(`\t`, `Workspace Directory:`, workspace.path);
    console.log(``);
    console.log(`Changes:`);
    console.log(``);
    let collection = await repository.getFiles();
    let added = 0;
    let modified = 0;
    if (collection.files) {
        let resource;
        for (resource of collection.files) {
            let path = upath_1.join(workspace.path, resource.path);
            let file = new File_1.default(path);
            if (await file.exists()) {
                let shasum = await file.getShaSum();
                if (shasum !== resource.checksum) {
                    await file.write(resource.contents);
                    console.log(`\t`, `Modified:`, resource.path);
                    modified += 1;
                }
            }
            else {
                await file.write(resource.contents);
                console.log(`\t`, 'Added:', resource.path);
                added += 1;
            }
        }
    }
    if (!modified || added) {
        console.log(`\t`, `No changes.`);
    }
    console.log(``);
    console.log('Done.');
};
