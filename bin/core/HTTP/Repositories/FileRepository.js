"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FilesCollection_1 = require("../Collections/FilesCollection");
const FileResource_1 = require("../Resources/FileResource");
class FilesRepository {
    constructor(client) {
        this.path = '/files';
        this.client = client;
    }
    async getFiles() {
        try {
            let response = await this.client.get(this.path);
            let collection = FilesCollection_1.default.fromJSON(response.result);
            collection.client = this.client;
            if (collection.files) {
                collection.files.forEach((file) => {
                    file.client = this.client;
                });
            }
            return collection;
        }
        catch (e) {
            throw e;
        }
    }
    async getFile(path) {
        let response = await this.client.get(path);
        let resource = FileResource_1.default.fromJSON(response.result);
        resource.client = this.client;
        return resource;
    }
}
exports.default = FilesRepository;
