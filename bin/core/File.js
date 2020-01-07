"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const crypto = require("crypto-promise");
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
        return await fs.readFile(this.location, { encoding: 'base64' });
    }
    async exists() {
        return await fs.exists(this.location);
    }
    async getShaSum(algorithm = '256') {
        const contents = await this.read();
        const buffer = await crypto.hash('sha' + algorithm)(contents);
        return buffer.toString('hex');
    }
}
exports.default = File;
