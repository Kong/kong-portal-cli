"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const WorkspaceTheme_1 = require("./WorkspaceTheme");
const WorkspaceConfig_1 = require("./WorkspaceConfig");
const WorkspacePortalConfig_1 = require("./WorkspacePortalConfig");
class Workspace {
    constructor(name) {
        this.name = name;
        this.location = Workspace.getDirectoryPath(name);
        this.config = new WorkspaceConfig_1.default(this.location, 'cli.conf.yaml');
        this.portalConfig = new WorkspacePortalConfig_1.default(this.location, 'portal.conf.yaml');
    }
    async getCurrentTheme() {
        return await WorkspaceTheme_1.default.init(this.location, this.getCurrentThemeName());
    }
    getCurrentThemeName() {
        return this.portalConfig.theme;
    }
    getLocation() {
        return this.location;
    }
    getConfig(key) {
        return key ? this.config[key] : this.config;
    }
    getPortalConfig(key) {
        return key ? this.portalConfig[key] : this.portalConfig;
    }
    static async init(name) {
        const workspace = new Workspace(name);
        await workspace.config.load();
        await workspace.portalConfig.load();
        return workspace;
    }
    static async exists(name) {
        try {
            const stat = await fs.lstat(Workspace.getDirectoryPath(name));
            return stat && stat.isDirectory();
        }
        catch (e) {
            return false;
        }
    }
    static getDirectoryPath(name) {
        return path.join(process.cwd(), 'workspaces', name);
    }
}
exports.default = Workspace;
