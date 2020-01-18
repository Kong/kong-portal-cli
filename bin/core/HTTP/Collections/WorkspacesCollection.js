"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WorkspaceResource_1 = require("../Resources/WorkspaceResource");
const RestCollection_1 = require("../RestCollection");
class WorkspacesCollection extends RestCollection_1.default {
    constructor(json) {
        super('/workspaces');
        this.workspaces = json.data || json.files || [];
        this.next = json.next;
    }
    async getNext() {
        return super.getNext(this.next, WorkspacesCollection);
    }
    static fromJSON(json) {
        return RestCollection_1.default.fromJSON(WorkspacesCollection, WorkspaceResource_1.default, json);
    }
}
exports.default = WorkspacesCollection;
