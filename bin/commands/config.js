"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Workspace_1 = require("../core/Workspace");
const clipanion_1 = require("clipanion");
function MissingWorkspaceError(name) {
    const message = [
        `No workspace named "${name}" was found.`,
        ``,
        `Directories scanned:`,
        `\t${Workspace_1.default.getDirectoryPath(name)}`
    ];
    throw new clipanion_1.UsageError(message.join('\n'));
}
function MissingWorkspaceThemeError(workspace) {
    const message = [
        `Unable to find theme "${workspace.getCurrentThemeName()}" in workspace "${workspace.name}".`,
    ];
    throw new clipanion_1.UsageError(message.join('\n'));
}
function ConfigToConsole(name, config) {
    console.log(``);
    console.log(`${name}:`);
    config.toConsole();
}
module.exports = async (args) => {
    const workspaceExists = await Workspace_1.default.exists(args.workspace);
    if (!workspaceExists)
        MissingWorkspaceError(args.workspace);
    const workspace = await Workspace_1.default.init(args.workspace);
    ConfigToConsole('CLI Config', workspace.config);
    ConfigToConsole('Portal Config', workspace.portalConfig);
    try {
        const theme = await workspace.getCurrentTheme();
        ConfigToConsole('Theme Config Options', theme.config);
        theme.outputStatsToConsole();
    }
    catch (e) {
        MissingWorkspaceThemeError(workspace);
    }
};
