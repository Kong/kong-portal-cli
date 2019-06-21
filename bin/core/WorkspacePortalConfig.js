"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("./Config");
class WorkspacePortalConfig extends Config_1.default {
    get theme() {
        return this.data.theme;
    }
    set theme(theme) {
        this.data.theme = theme;
    }
}
exports.default = WorkspacePortalConfig;
