"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rs = require("recursive-readdir-async");
const fs = require("fs-extra");
const upath_1 = require("upath");
const File_1 = require("./File");
const FileResource_1 = require("./HTTP/Resources/FileResource");
class WorkspaceContent {
    constructor(location) {
        this.location = upath_1.toUnix(location);
        this.path = upath_1.join(location, 'content');
        this.files = null;
    }
    async scan() {
        this.files = await rs.list(this.path, { exclude: ['.DS_Store'] });
        if (this.files) {
            this.files = this.files.map((file) => {
                const unixName = upath_1.toUnix(file.fullname);
                return {
                    file: new File_1.default(unixName),
                    resource: new FileResource_1.default({
                        path: unixName.replace(`${this.location}/`, ''),
                        contents: '',
                    }),
                };
            });
        }
    }
    async addContent() {
        console.log('not yet implemented');
    }
    outputStatsToConsole() {
        const contentLength = this.files ? this.files.length : 0;
        console.log(``);
        console.log(`Total Content:`, contentLength);
    }
    static async init(location) {
        const content = new WorkspaceContent(location);
        await content.scan();
        return content;
    }
    static async exists(location) {
        try {
            const stat = await fs.lstat(WorkspaceContent.getDirectoryPath(location));
            return stat && stat.isDirectory();
        }
        catch (e) {
            return false;
        }
    }
    static getDirectoryPath(location) {
        return upath_1.join(location, 'content');
    }
}
exports.default = WorkspaceContent;
