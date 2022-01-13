import { User } from "./types/DisadusTypes";

export type RequestResponse<T> = {
  event: string;
  success: boolean;
  data: T;
};
export type RawResponse<T> = {
  requestID: string;
  response: RequestResponse<T>;
};
export class APIWrapper {
  _ready: boolean = false;
  _parent: MessageEventSource | null = null;
  requests: Map<string, (data: RawResponse<any>) => void> = new Map();
  get readyState(): boolean {
    return this._ready;
  }
  constructor() {
    window.addEventListener("message", this.processMessage);
  }
  processMessage(event: MessageEvent): void {
    const message = event.data as RawResponse<any>;
    if (message.response) {
      const callback = this.requests.get(message.requestID);
      if (callback) {
        callback(message);
      }
      this.requests.delete(message.requestID);
    }
  }
  sendMessage(message: string): void {}
  ready(event: MessageEvent): void {
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
  sendRequest(name: string, data: any): Promise<RequestResponse<any>> {
    return new Promise((resolve, reject) => {
      const requestId = this.getRequestId();
      this.requests.set(requestId, (response) => {
        resolve(response.response);
      });
    });
  }
  getUser(userid: string): Promise<RequestResponse<User>> {
    return this.sendRequest("getUser", {
      userid,
    });
  }
  
}
