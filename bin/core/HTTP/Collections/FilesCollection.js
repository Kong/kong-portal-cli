"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileResource_1 = require("../Resources/FileResource");
const RestCollection_1 = require("../RestCollection");
class FilesCollection extends RestCollection_1.default {
    constructor(json) {
        super('/files');
        this.files = json.data || json.files || [];
        this.next = json.next;
    }
    async getNext() {
        return super.getNext(this.next, FilesCollection);
    }
    static fromJSON(json) {
        return RestCollection_1.default.fromJSON(FilesCollection, FileResource_1.default, json);
    }
}
exports.default = FilesCollection;
