"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clipanion_1 = require("clipanion");
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
    let collection = await repository.getFiles();
    if (collection.files) {
        let resource;
        for (resource of collection.files) {
            try {
                await resource.delete();
                console.log(`\tDeleted ${resource.path}`);
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    console.log('Done.');
};
