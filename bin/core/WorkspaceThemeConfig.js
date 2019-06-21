"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("./Config");
class WorkspaceThemeConfig extends Config_1.default {
    get colors() {
        return this.data.colors;
    }
    set colors(colors) {
        this.data.colors = colors;
    }
}
exports.default = WorkspaceThemeConfig;
