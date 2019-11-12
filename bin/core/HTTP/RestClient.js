"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const got = require("got");
class RestClientError extends Error {
    constructor(res, message) {
        super(message);
        this.response = res;
    }
}
exports.RestClientError = RestClientError;
class RestClient {
    constructor(workspaceConfig, workspaceName) {
        this.clientHeaders = workspaceConfig.headers || {};
        if (workspaceConfig.adminUrl) {
            this.clientUrl = `${workspaceConfig.adminUrl}/${workspaceName}`;
        }
        else if (workspaceConfig.upstream) {
            console.log('upstream is deprecated and will cease to function in a later release. Please use admin_url (upstream url without the workspace suffix)');
            this.clientUrl = workspaceConfig.upstream;
        }
        else {
            this.clientUrl = '';
        }
        if (workspaceConfig.rbacToken) {
            this.clientHeaders['Kong-Admin-Token'] = workspaceConfig.rbacToken;
        }
        this.client = got.extend({
            baseUrl: this.clientUrl,
            headers: this.clientHeaders,
            json: true,
        });
    }
    async get(resource, options = {}) {
        return this.handleResponse(await this.client.get(resource, options));
    }
    async create(resource, options = {}) {
        options.body = resource.toObject();
        return this.handleResponse(await this.client.post(resource.getResourcePath(), options));
    }
    async update(resource, options = {}) {
        options.body = resource.toObject();
        return this.handleResponse(await this.client.patch(resource.getResourcePath(), options));
    }
    async save(resource, options = {}) {
        options.body = resource.toObject();
        try {
            let response = await this.client.put(resource.getResourcePath(), options);
            return this.handleResponse(response);
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    }
    async delete(resource, options = {}) {
        return this.handleResponse(await this.client.delete(resource.getResourcePath(), options));
    }
    handleResponse(res) {
        let statusCode = res.statusCode || 500;
        let result = res.body;
        if (statusCode > 399) {
            throw new RestClientError({
                statusCode,
                result,
                headers: res.headers,
            });
        }
        const response = {
            statusCode,
            result,
            headers: res.headers,
        };
        return response;
    }
}
exports.default = RestClient;
