import { PublicUser, User } from "./types/DisadusTypes";

export type RequestResponse<T> = {
  event: string;
  success: boolean;
  data: T;
};
export type RawResponse<T> = {
  requestID: string;
  response: RequestResponse<T>;
};
export type RawRequest<T> = {
  requestID: string;
  event: string;
  request: T;
};
export class APIWrapper {
  _ready: boolean = false;
  _parent: MessageEventSource | null = null;
  requests: Map<string, (data: RawResponse<any>) => void> = new Map();
  get readyState(): boolean {
    return this._ready;
  }
  static _self: APIWrapper;
  static get self(): APIWrapper {
    if (!APIWrapper._self) {
      APIWrapper._self = new APIWrapper();
    }
    return APIWrapper._self;
  }
  constructor() {
    window.top?.postMessage({
      event: "connect",
    });
    window.onmessage = this.ready;
  }
  processMessage(event: MessageEvent): void {
    const message = JSON.parse(event.data) as RawResponse<any>;
    if (message.response) {
      const callback = this.requests.get(message.requestID);
      if (callback) {
        callback(message);
      }
      this.requests.delete(message.requestID);
    }
  }
  ready(event: MessageEvent): void {
    this._parent = event.source;
    this._ready = true;
    window.onmessage = this.processMessage;
  }
  getRequestId() {
    let requestId = Math.random().toString(36).substring(2);
    while (this.requests.has(requestId)) {
      requestId = Math.random().toString(36).substring(2);
    }
    return requestId;
  }
  sendRequest(name: string, data: any): Promise<RequestResponse<any>> {
    return new Promise(async (resolve, reject) => {
      const requestId = this.getRequestId();
      const message = {
        requestID: requestId,
        event: name,
        request: data,
      } as RawRequest<any>;
      while (!this._ready) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      window.top?.postMessage(JSON.stringify(message), "*", []);
      this.requests.set(requestId, (response) => {
        resolve(response.response);
      });
    });
  }
  getUser(userid: string): Promise<RequestResponse<PublicUser>> {
    return this.sendRequest("getUser", {
      userid,
    });
  }
  getSelf(): Promise<RequestResponse<User>> {
    return this.sendRequest("getSelf", {});
  }
}
