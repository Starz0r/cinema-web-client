import { Join, RPCResponse } from "@/rpc/server";
import { RPCMessage } from "@/rpc/message";
import { RPCRequest } from "./client";

type RPCHandler = <T extends RPCResponse>(rid: number, payload: T) => Promise<void>;

export class RPCManager {
    protected ws: WebSocket;
    protected finalizer: FinalizationRegistry = new FinalizationRegistry(() => { this.ws.close() });
    protected handlers: Map<string, [RPCResponse, RPCHandler]>;

    private bindedOnMsgEvtHandler: (evt: MessageEvent) => Promise<void>;

    constructor(endpoint: string) {
        this.handlers = new Map<string, [RPCResponse, RPCHandler]>();
        this.bindedOnMsgEvtHandler = this.on_msg.bind(this);

        this.ws = new WebSocket(endpoint);
        this.ws.addEventListener("open", this.on_open);
        this.ws.addEventListener("close", this.on_close);
        this.ws.addEventListener("message", this.bindedOnMsgEvtHandler, false);
    }

    register = (call: string, ty: typeof RPCResponse) => (fn: RPCHandler, ctx: ClassMethodDecoratorContext) => {
        this.handlers.set(call, [ty, fn]);
    }

    register2<T extends RPCResponse>(cmd: string, ty: T, fn: RPCHandler): void {
        this.handlers.set(cmd, [ty, fn]);
    }

    private on_open(evt: Event): void {
        console.log(evt);
    }

    private on_close(evt: CloseEvent): void {
        console.log(evt);
    }

    private async on_msg(evt: MessageEvent): Promise<void> {
        if ((evt.data instanceof ArrayBuffer) || (evt.data instanceof Blob)) {
            return console.error("message was not in text format");
        }

        const values = (evt.data as string).split(" ", 3);
        const rid: number = parseInt(values[0]);
        const command: string = values[1];
        const payload: RPCResponse = JSON.parse(values[2]);

        console.log(evt.data);
        console.log(values);

        await this.handlers.get(command)[1](rid, payload);
    }

    is_ready(): boolean {
        return this.ws.readyState === 1
    }

    send_message(rid: number, command: string, payload: RPCRequest) {
        const msg = new RPCMessage(rid, command, payload);
        this.ws.send(msg.toString());
    }

    close(code?: number, reason?: string): void {
        if (this.ws.readyState !== 0) {
            if (this.ws.readyState !== 1) {
                console.log(this.ws.readyState);
                return this.ws.close(code, reason);
            }
        }
    }
}



