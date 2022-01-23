import { Community, PublicUser, User } from "./types/DisadusTypes";

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
export type TokenInfo = {
  token: string;
  expires: number;
} | null;
export enum PluginIntent {
  // Chat
  getSelf = "getSelf",
  getUser = "getUser",
  getUsers = "getUsers",
  getAssignment = "getAssignment",
  getCourse = "getCourse",
  getCommunity = "getCommunity",
}
export class APIWrapper {
  _ready: boolean = false;
  _parent: MessageEventSource | null = null;
  _token: TokenInfo = null;
  requests: Map<string, (data: RawResponse<any>) => void> = new Map();
  get readyState(): boolean {
    return this._ready;
  }
  static _self: APIWrapper;
  static getInstance(): APIWrapper {
    if (!APIWrapper._self) {
      APIWrapper._self = new APIWrapper();
    }
    return APIWrapper._self;
  }

  constructor() {
    this.init();
  }
  init() {
    if (window.top) {
      console.log("[APIWrapper]", "Constructing APIWrapper");
      window.top.postMessage(
        JSON.stringify({
          event: "connect",
        }),
        "*",
        []
      );
    } else {
      console.error("No window.top");
    }
    window.addEventListener("message", this.ready.bind(this));
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
    if (this._ready) {
      console.error("[APIWrapper]", "Already ready");
      return;
    }
    console.log("[APIWrapper]", "readyy");
    this._ready = true;
    const tokenInfo = JSON.parse(event.data) as TokenInfo;
    this._token = tokenInfo;
    console.log("[APIWrapper]", "Token", tokenInfo,event);
    window.addEventListener("message", this.processMessage.bind(this));
    window.removeEventListener("message", this.ready.bind(this));
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
  async requestIntents(intents: PluginIntent[]) {
    const result = (await this.sendRequest("requestIntents", {
      intents,
    })) as RequestResponse<TokenInfo>;
    if (result.success) {
      this._token = result.data;
    } else {
      console.error("[APIWrapper]", "RequestIntents failed", result);
    }
    return result.success;
  }
  async waitForToken() {
    while (!this._token) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    return this._token;
  }
  async getUser(userid: string): Promise<PublicUser | null> {
    return fetch(`https://api.disadus.app/user/${userid}`, {})
      .then((res) => res.json())
      .catch(() => null);
  }
  async getSelf(): Promise<User | null> {
    const token = await this.waitForToken();
    return fetch(`https://api.disadus.app/user/@me`, {
      headers: {
        Authorization: `Plugin ${token.token}`,
      },
    })
      .then((res) => res.json())
      .catch(() => null);
  }
  async getCommunity(communityid: string): Promise<Community | null> {
    return fetch(`https://api.disadus.app/community/${communityid}`, {})
      .then((res) => res.json())
      .catch(() => null);
  }
}
