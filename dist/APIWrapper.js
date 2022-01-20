"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIWrapper = void 0;
class APIWrapper {
    constructor() {
        this._ready = false;
        this._parent = null;
        this.requests = new Map();
        window.addEventListener("message", this.processMessage);
        window.addEventListener("message", this.ready);
    }
    get readyState() {
        return this._ready;
    }
    static get self() {
        if (!APIWrapper._self) {
            APIWrapper._self = new APIWrapper();
        }
        return APIWrapper._self;
    }
    processMessage(event) {
        const message = event.data;
        if (message.response) {
            const callback = this.requests.get(message.requestID);
            if (callback) {
                callback(message);
            }
            this.requests.delete(message.requestID);
        }
    }
    ready(event) {
        this._parent = event.source;
        this._ready = event.data.success;
        window.removeEventListener("message", this.ready);
    }
    getRequestId() {
        let requestId = Math.random().toString(36).substring(2);
        while (this.requests.has(requestId)) {
            requestId = Math.random().toString(36).substring(2);
        }
        return requestId;
    }
    sendRequest(name, data) {
        return new Promise((resolve, reject) => {
            var _a;
            const requestId = this.getRequestId();
            const message = {
                requestID: requestId,
                event: name,
                request: data,
            };
            (_a = this._parent) === null || _a === void 0 ? void 0 : _a.postMessage(message);
            this.requests.set(requestId, (response) => {
                resolve(response.response);
            });
        });
    }
    getUser(userid) {
        return this.sendRequest("getUser", {
            userid,
        });
    }
    getSelf() {
        return this.sendRequest("getSelf", {});
    }
}
exports.APIWrapper = APIWrapper;
