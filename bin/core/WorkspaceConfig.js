"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("./Config");
class WorkspaceConfig extends Config_1.default {
    get name() {
        return this.data.name;
    }
    set name(name) {
        this.data.name = name;
    }
    get description() {
        return this.data.description;
    }
    set description(text) {
        this.data.description = text;
    }
    get adminUrl() {
        return this.data.admin_url;
    }
    set adminUrl(url) {
        this.data.admin_url = url;
    }
    get upstream() {
        return this.data.upstream;
    }
    set upstream(url) {
        this.data.upstream = url;
    }
    get headers() {
        return this.data.headers || {};
    }
    set headers(headers) {
        this.data.headers = headers;
    }
    get rbacToken() {
        return this.data.rbac_token;
    }
    set rbacToken(token) {
        this.data.rbac_token = token;
    }
}
exports.default = WorkspaceConfig;
