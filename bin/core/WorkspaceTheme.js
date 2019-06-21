"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rs = require("recursive-readdir-async");
const fs = require("fs-extra");
const path_1 = require("path");
const WorkspaceThemeConfig_1 = require("./WorkspaceThemeConfig");
class WorkspaceTheme {
    constructor(location, name) {
        this.name = name;
        this.location = location;
        this.path = WorkspaceTheme.getDirectoryPath(location, name);
        this.config = new WorkspaceThemeConfig_1.default(this.path, 'theme.conf.yaml');
        this.assetsPath = path_1.join(this.path, 'assets');
        this.layoutsPath = path_1.join(this.path, 'layouts');
        this.partialsPath = path_1.join(this.path, 'partials');
        this.assets = null;
        this.layouts = null;
        this.partials = null;
    }
    async scan() {
        this.assets = await rs.list(this.assetsPath);
        this.layouts = await rs.list(this.layoutsPath);
        this.partials = await rs.list(this.partialsPath);
    }
    async addLayout() {
        console.log('not yet implemented');
    }
    async addPartial() {
        console.log('not yet implemented');
    }
    outputStatsToConsole() {
        const assetsLength = this.assets ? this.assets.length : 0;
        const layoutsLength = this.layouts ? this.layouts.length : 0;
        const partialsLength = this.partials ? this.partials.length : 0;
        console.log(``);
        console.log(`Total Theme Files:`, assetsLength + layoutsLength + partialsLength);
        console.log(`  `, `Assets:`, assetsLength);
        console.log(`  `, `Layouts:`, layoutsLength);
        console.log(`  `, `Partials:`, partialsLength);
    }
    static async init(location, name) {
        const theme = new WorkspaceTheme(location, name);
        await theme.config.load();
        await theme.scan();
        return theme;
    }
    static async exists(location, name) {
        try {
            const stat = await fs.lstat(WorkspaceTheme.getDirectoryPath(location, name));
            return stat && stat.isDirectory();
        }
        catch (e) {
            return false;
        }
    }
    static getDirectoryPath(location, name) {
        return path_1.join(location, 'themes', name);
    }
}
exports.default = WorkspaceTheme;
