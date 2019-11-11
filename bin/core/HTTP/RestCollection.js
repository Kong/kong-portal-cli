"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const upath_1 = require("upath");
class RestCollection {
    constructor(resourcePath) {
        this.resourcePath = resourcePath;
    }
    async save(entity, options) {
        if (this.client) {
            return await this.client.save(entity, options);
        }
        return console.log('no rest client passed');
    }
    async delete(entity, options) {
        if (this.client) {
            return await this.client.delete(entity, options);
        }
        return console.log('no rest client passed');
    }
    async getNext(next, entity) {
        if (!next) {
            return;
        }
        if (this.client) {
            let response = await this.client.get(next);
            return entity.fromJSON(response.result);
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
    getResourcePath(path = '') {
        return upath_1.join(this.resourcePath, path);
    }
    static fromJSON(entity, children, json) {
        if (json.data) {
            json.data = json.data.map((element) => {
                return children.fromJSON(element);
            });
        }
        return new entity(json);
    }
}
exports.default = RestCollection;
