"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const upath_1 = require("upath");
class RestResource {
    constructor(resourcePath) {
        this.resourcePath = resourcePath;
    }
    async save(options) {
        if (this.client) {
            return await this.client.save(this, options);
        }
        return console.log('no rest client passed');
    }
    async delete(options) {
        if (this.client) {
            return await this.client.delete(this, options);
        }
        return console.log('no rest client passed');
    }
    toObject() {
        let o = Object.assign({}, this);
        delete o.resourcePath;
        return o;
    }
    toJSON() {
        return this.toObject();
    }
    getResourcePath(path) {
        return upath_1.join(this.resourcePath, path);
    }
    static fromJSON(child, json) {
        return new child(json);
    }
}
exports.default = RestResource;
