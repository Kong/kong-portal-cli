"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RestResource_1 = require("../RestResource");
class WorkspaceResource extends RestResource_1.default {
    constructor(json) {
        super('/workspaces');
        this.id = json.id;
        this.name = json.name;
        this.config = json.config;
    }
    getResourcePath() {
        return super.getResourcePath(this.id || this.name);
    }
    static fromJSON(json) {
        return RestResource_1.default.fromJSON(WorkspaceResource, json);
    }
}
exports.default = WorkspaceResource;
