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
    get kongAdminUrl() {
        return this.data.kong_admin_url;
    }
    set kongAdminUrl(url) {
        this.data.kong_admin_url = url;
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
    get kongAdminToken() {
        return this.data.kong_admin_token;
    }
    set kongAdminToken(token) {
        this.data.kong_admin_token = token;
    }
}
exports.default = WorkspaceConfig;
