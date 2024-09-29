export interface RPCRequest { }

export interface Hello extends RPCRequest {
    name: string,
    passwd?: string,
}

export interface Enqueue extends RPCRequest {
    url: string
}

export interface Deque extends RPCRequest {
    index: number
}

export interface Pause extends RPCRequest {
    position?: number
}

export interface Resume extends RPCRequest { }

export interface Seek extends RPCRequest {
    position: number
}
