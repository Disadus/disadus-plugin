"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIWrapper = void 0;
class APIWrapper {
    constructor() {
        this._ready = false;
        this._parent = null;
        this.requests = new Map();
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
    init() {
        if (window.top) {
            console.log("[APIWrapper]", "Constructing APIWrapper");
            window.top.postMessage(JSON.stringify({
                event: "connect",
            }), "*", []);
        }
        else {
            console.error("No window.top");
        }
        window.addEventListener("message", this.ready);
    }
    processMessage(event) {
        const message = JSON.parse(event.data);
        if (message.response) {
            const callback = this.requests.get(message.requestID);
            if (callback) {
                callback(message);
            }
            this.requests.delete(message.requestID);
        }
    }
    ready(event) {
        console.log("[APIWrapper]", "ready");
        this._ready = true;
        window.addEventListener("message", this.processMessage);
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
        return new Promise(async (resolve, reject) => {
            var _a;
            const requestId = this.getRequestId();
            const message = {
                requestID: requestId,
                event: name,
                request: data,
            };
            while (!this._ready) {
                await new Promise((resolve) => setTimeout(resolve, 20));
                console.log("[APIWrapper]", "Waiting for ready");
            }
            console.log("[APIWrapper]", "Sending request", message);
            (_a = window.top) === null || _a === void 0 ? void 0 : _a.postMessage(JSON.stringify(message), "*", []);
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
