import { User } from "./types/DisadusTypes";
export declare type RequestResponse<T> = {
    event: string;
    success: boolean;
    data: T;
};
export declare type RawResponse<T> = {
    requestID: string;
    response: RequestResponse<T>;
};
export declare class APIWrapper {
    _ready: boolean;
    _parent: MessageEventSource | null;
    requests: Map<string, (data: RawResponse<any>) => void>;
    get readyState(): boolean;
    constructor();
    processMessage(event: MessageEvent): void;
    sendMessage(message: string): void;
    ready(event: MessageEvent): void;
    getRequestId(): string;
    sendRequest(name: string, data: any): Promise<RequestResponse<any>>;
    getUser(userid: string): Promise<RequestResponse<User>>;
}
//# sourceMappingURL=APIWrapper.d.ts.map