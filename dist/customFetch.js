"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nFetch = void 0;
// eslint-disable-next-line no-eval
const fetchPromise = eval('import("node-fetch")').then((mod) => mod.default);
const nFetch = (...args) => {
    if (globalThis.fetch) {
        return globalThis.fetch(...args);
    }
    return fetchPromise.then((fetch) => fetch(...args));
};
exports.nFetch = nFetch;
exports.default = exports.nFetch;
