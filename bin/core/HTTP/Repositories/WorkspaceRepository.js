"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WorkspacesCollection_1 = require("../Collections/WorkspacesCollection");
const WorkspaceResource_1 = require("../Resources/WorkspaceResource");
class WorkspaceRepository {
    constructor(client) {
        this.path = '/workspaces';
        this.client = client;
    }
    async getWorkspaces() {
        try {
            let response = await this.client.get(this.path);
            let collection = WorkspacesCollection_1.default.fromJSON(response.result);
            collection.client = this.client;
            if (collection.workspaces) {
                collection.workspaces.forEach((file) => {
                    file.client = this.client;
                });
            }
            return collection;
        }
        catch (e) {
            throw e;
        }
    }
    async getWorkspace(path) {
        let response = await this.client.get("workspaces/" + path);
        let resource = WorkspaceResource_1.default.fromJSON(response.result);
        return resource;
    }
}
exports.default = WorkspaceRepository;
