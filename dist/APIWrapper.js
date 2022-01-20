"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIWrapper = void 0;
class APIWrapper {
    constructor() {
        this._ready = false;
        this._parent = null;
        this.requests = new Map();
        window.addEventListener("message", this.processMessage);
    }
    get readyState() {
        return this._ready;
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
    sendMessage(message) { }
    ready(event) {
        this._parent = event.source;
        this._ready = true;
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
            const requestId = this.getRequestId();
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
}
exports.APIWrapper = APIWrapper;
