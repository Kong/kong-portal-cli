"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rs = require("recursive-readdir-async");
const fs = require("fs-extra");
const path_1 = require("path");
const File_1 = require("./File");
const FileResource_1 = require("./HTTP/Resources/FileResource");
class WorkspaceEmails {
    constructor(location) {
        this.location = location;
        this.path = path_1.join(location, 'emails');
        this.files = null;
    }
    async scan() {
        this.files = await rs.list(this.path, { exclude: ['.DS_Store'] });
        if (this.files) {
            this.files = this.files.map((file) => {
                return {
                    file: new File_1.default(file.fullname),
                    resource: new FileResource_1.default({
                        path: file.fullname.replace(`${this.location}/`, ''),
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
        const content = new WorkspaceEmails(location);
        await content.scan();
        return content;
    }
    static async exists(location) {
        try {
            const stat = await fs.lstat(WorkspaceEmails.getDirectoryPath(location));
            return stat && stat.isDirectory();
        }
        catch (e) {
            return false;
        }
    }
    static getDirectoryPath(location) {
        return path_1.join(location, 'emails');
    }
}
exports.default = WorkspaceEmails;
