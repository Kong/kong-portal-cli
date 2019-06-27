"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rs = require("recursive-readdir-async");
const fs = require("fs-extra");
const path_1 = require("path");
const WorkspaceThemeConfig_1 = require("./WorkspaceThemeConfig");
const FileResource_1 = require("./HTTP/Resources/FileResource");
const File_1 = require("./File");
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
    async scanAssets() {
        let assets = await rs.list(this.assetsPath);
        this.assets = this.mapFilesToContent(assets);
    }
    async scanLayouts() {
        let layouts = await rs.list(this.layoutsPath);
        this.layouts = this.mapFilesToContent(layouts);
    }
    async scanPartials() {
        let partials = await rs.list(this.partialsPath);
        this.partials = this.mapFilesToContent(partials);
    }
    mapFilesToContent(files) {
        return files.map((file) => {
            return {
                file: new File_1.default(file.fullname),
                resource: new FileResource_1.default({
                    path: file.fullname.replace(this.location + '/', ''),
                    contents: '',
                }),
            };
        });
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
        await theme.scanAssets();
        await theme.scanLayouts();
        await theme.scanPartials();
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
