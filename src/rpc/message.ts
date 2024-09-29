import { RPCRequest } from "@/rpc/client";
import { RPCResponse } from "@/rpc/server";

export class RPCMessage {
    private rid: number;
    private command: string;
    private payload: RPCRequest | RPCResponse;

    constructor(rid: number, command: string, payload: RPCRequest | RPCResponse) {
        this.rid = rid;
        this.command = command;
        this.payload = payload;
    }

    toString(): string {
        const pl = JSON.stringify(this.payload);
        return `${this.rid} ${this.command} ${pl}`;
    }
}
