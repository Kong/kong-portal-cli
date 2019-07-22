"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("./Config");
const fs = require("fs-extra");
const yaml = require("js-yaml");
class WorkspaceRouterConfig extends Config_1.default {
    async load() {
        try {
            const content = await fs.readFile(this.path, this.encoding);
            this.data = yaml.safeLoad(content);
        }
        catch (_a) {
            this.data = null;
        }
    }
}
exports.default = WorkspaceRouterConfig;
