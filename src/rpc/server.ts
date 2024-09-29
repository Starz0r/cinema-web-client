export interface RPCResponse { }

export interface Ok extends RPCResponse { }

export interface Err extends RPCResponse {
    err: string,
    code?: number,
    reason?: string,
    details?: string
}

export interface Results<Contents> extends RPCResponse { output: Contents }

export interface Join extends RPCResponse {
    user: string
}

export interface NowPlaying extends RPCResponse {
    media?: string
}

export interface Pausing extends RPCResponse {
    position?: number
}

export interface Resuming extends RPCResponse { }

export interface Enqueued extends RPCResponse {
    url: string,
    media?: {
        url: string,
        title: string,
        duration: number,
    },
    submitted_by?: string
}

export interface Dequeued extends RPCResponse {
    index: number,
    url?: string
}
