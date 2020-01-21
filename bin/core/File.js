"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const crypto = require("crypto-promise");
const isbinaryfile_1 = require("isbinaryfile");
class File {
    constructor(location, options = {
        encoding: 'utf8',
    }) {
        this.location = location;
        this.encoding = options.encoding || 'utf8';
    }
    async write(contents) {
        return await fs.outputFile(this.location, contents, this.encoding);
    }
    async read() {
        return await fs.readFile(this.location, this.encoding);
    }
    async read64() {
        let fileExtMatch = this.location.match(/\w+$/);
        let fileExt = 'unknown';
        if (fileExtMatch) {
            fileExt = fileExtMatch[0];
        }
        const encoded = await fs.readFile(this.location, { encoding: 'base64' });
        return `data:image/${fileExt};base64,${encoded}`;
    }
    async write64(contents) {
        contents = contents.split(';base64,')[1];
        return await fs.outputFile(this.location, Buffer.from(contents, 'base64'), this.encoding);
    }
    async exists() {
        return await fs.exists(this.location);
    }
    async getShaSum(algorithm = '256') {
        let contents;
        if (await isbinaryfile_1.isBinaryFile(this.location)) {
            contents = await this.read64();
        }
        else {
            contents = await this.read();
        }
        const buffer = await crypto.hash('sha' + algorithm)(contents);
        return buffer.toString('hex');
    }
}
exports.default = File;
