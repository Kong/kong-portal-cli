"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RestResource_1 = require("../RestResource");
class FileResource extends RestResource_1.default {
    constructor(json) {
        super('/files');
        this.id = json.id;
        this.path = json.path;
        this.contents = json.contents;
        this.checksum = json.checksum;
        this.auth = json.auth;
    }
    getResourcePath() {
        return super.getResourcePath(this.id || this.path);
    }
    static fromJSON(json) {
        return RestResource_1.default.fromJSON(FileResource, json);
    }
}
exports.default = FileResource;
