"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clipanion_1 = require("clipanion");
const RestClient_1 = require("../core/HTTP/RestClient");
const WorkspaceRepository_1 = require("../core/HTTP/Repositories/WorkspaceRepository");
const Workspace_1 = require("../core/Workspace");
const ora = require("ora");
function MissingWorkspaceError(name) {
    const message = [
        `No workspace named "${name}" was found.`,
        ``,
        `Directories scanned:`,
        `\t${Workspace_1.default.getDirectoryPath(name)}`,
    ];
    throw new clipanion_1.UsageError(message.join('\n'));
}
;
exports.default = async (args) => {
    let workspace;
    let client;
    try {
        workspace = await Workspace_1.default.init(args.workspace);
    }
    catch (e) {
        return MissingWorkspaceError(args.workspace);
    }
    let spinner = ora({
        prefixText: `Enabling ${workspace.name} Portal...`
    });
    spinner.start();
    try {
        client = new RestClient_1.default(workspace.config, workspace.name);
        let wsRepository = new WorkspaceRepository_1.default(client);
        let ws = await wsRepository.getWorkspace(workspace.name);
        ws.config.portal = true;
        await client.save(ws, {
            body: ws.toObject()
        });
        spinner.prefixText = `\t`;
        spinner.text = `'${workspace.name}' Portal Enabled`;
        spinner.succeed();
    }
    catch (e) {
        spinner.fail(e.message);
    }
};
