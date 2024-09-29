"use client";

export const dynamicParams = true;

import '@vidstack/react/player/styles/base.css';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaPlayerInstance, MediaProvider, useMediaState, useStore, MediaPauseRequestEvent, MediaPlayRequestEvent, MediaSeekRequestEvent, useMediaRemote } from '@vidstack/react';
import {
    DefaultAudioLayout,
    defaultLayoutIcons,
    DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import { InferGetStaticPropsType } from 'next';
import { useRouter, usePathname } from 'next/navigation';
import { invoke } from "@tauri-apps/api/tauri";
import { useMutableStore } from '@/utils/store';
import React, { MutableRefObject, useEffect, useState, useRef, MouseEventHandler, useCallback } from 'react';
import { flushSync } from "react-dom";
import type { Join, NowPlaying, Pausing, Resuming, Enqueued, Dequeued, Seeking, Ok, Results, Err } from "@/rpc/server";
import { Hello, Enqueue, Deque, Pause, Resume, Seek } from "@/rpc/client";
import { RPCManager } from "@/rpc/manager";

interface MediaInfo {
    url: string,
    title?: string,
    duration?: number,
    submitted_by: string
}

interface HelloResults {
    occupants: string[],
    queue?: {
        media: MediaInfo
        submitted_by: string,
    }[],
    roomstate: {
        nowplaying: string,
        position: number,
        paused: boolean
    }
}

function BaseMediaPlayer(ref: MutableRefObject<MediaPlayerInstance>, src: string, onPlayHook?: (nativeEvent: MediaPlayRequestEvent) => void, onPauseHook?: (nativeEvent: MediaPauseRequestEvent) => void, onSeekHook?: (seekTo: number, nativeEvent: MediaSeekRequestEvent) => void): React.JSX.Element {
    return (
        <MediaPlayer ref={ref} src={src} onMediaPlayRequest={onPlayHook} onMediaPauseRequest={onPauseHook} onMediaSeekRequest={onSeekHook} autoplay>
            <MediaProvider />
            <DefaultAudioLayout icons={defaultLayoutIcons} />
            <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
    )
}

// taken from: https://dev.to/ag-grid/react-18-avoiding-use-effect-getting-called-twice-4i9e
const useEffectOnce = (effect: () => void | (() => void)) => {
    const destroyFunc = useRef<void | (() => void)>();
    const effectCalled = useRef(false);
    const renderAfterCalled = useRef(false);
    const [val, setVal] = useState<number>(0);

    if (effectCalled.current) {
        renderAfterCalled.current = true;
    }

    useEffect(() => {
        // only execute the effect first time around
        if (!effectCalled.current) {
            destroyFunc.current = effect();
            effectCalled.current = true;
        }

        // this forces one render after the effect is run
        setVal((val) => val + 1);

        return () => {
            // if the comp didn't render since the useEffect was called,
            // we know it's the dummy React cycle
            if (!renderAfterCalled.current) {
                return;
            }
            if (destroyFunc.current) {
                destroyFunc.current();
            }
        };
    }, []);
};

export default function TheaterRoom() {
    const router = useRouter();
    const pathname = usePathname().split("/");
    const mplyr = useRef<MediaPlayerInstance>(null);
    const mplyrRemoteControl = useMediaRemote(mplyr);
    const [mplyrEl, setMplyrEl] = useState(BaseMediaPlayer(mplyr, ""));
    const rpcman = useRef<RPCManager | null>(null);

    // HACK: useSearchParams hook is seemingly broken, so use this instead
    //const roomId: string = pathname[3];
    const roomId: string = useMutableStore((state) => state.roomId);
    const serverUrl = useMutableStore((state) => state.server);

    const mplyrState = useStore(MediaPlayerInstance, mplyr);

    const [pendingResponseType, setPendingResponseType] = useState(new Map<number, string>());
    const [users, setUsers] = useState(new Array<string>());
    const [queue, setQueue] = useState(new Array<MediaInfo>());
    const [src, setSrc] = useState<string>("");
    const [nextReqId, setNextReqId] = useState(1);
    const [sidebarTab, setSidebarTab] = useState("users");

    console.log("did we just, re-render??");
    console.log(queue);

    const on_response_ok = async (rid: number, payload: Ok): Promise<void> => {
        () => { }
    }

    const on_response_res = async (rid: number, untypedPayload: Results<unknown>): Promise<void> => {
        const cbType = pendingResponseType.get(rid) as string;
        setPendingResponseType((prevMap) => {
            const m = new Map(prevMap);
            m.delete(rid);
            return m;
        });

        switch (cbType) {
            case "HELLO":
                console.log(untypedPayload);
                const payload = untypedPayload as Results<HelloResults>;
                setUsers(users.concat(payload.output.occupants));
                if ((payload.output.queue !== undefined) && (payload.output.queue !== null)) {
                    for (let item of payload.output.queue) {
                        setQueue(queue.concat(item.media));
                    }
                }
                break;
        }
    }

    const on_response_err = async (rid: number, payload: Err): Promise<void> => {
        () => { }
    }


    const on_join = async (_: number, payload: Join): Promise<void> => {
        setUsers(users.concat(payload.user));
    }

    const send_pause = (position?: number): void => {
        rpcman.current?.send_message(nextReqId, "PAUSE", {});
        console.log("PAUSE SENT");
        setNextReqId(nextReqId + 1);
    }

    const send_resume = (): void => {
        rpcman.current?.send_message(nextReqId, "RESUME", {});
        setNextReqId(nextReqId + 1);
    }

    const send_seek = (position: number): void => {
        rpcman.current?.send_message(nextReqId, "SEEK", { position: position });
        setNextReqId(nextReqId + 1);
    }

    const onPlayHook = (evt: MediaPlayRequestEvent): void => {
        send_resume();
    }

    const onPauseHook = (evt: MediaPauseRequestEvent): void => {
        send_pause();
    }

    const onSeekHook = (position: number, evt: MediaSeekRequestEvent): void => {
        // HACK: vidstack stupidly generates this event if we seek using the useMediaRemote hook.
        // so to avoid creating a loop of reseeking to the same position, we'll check if we're already there,
        // and ignore the event if we have.
        if (mplyr.current.currentTime === position) {
            return
        }
        send_seek(position);
    }

    const on_nowplaying = useCallback(async (_: number, payload: NowPlaying): Promise<void> => {
        try {
            var mediaUrl: string = await invoke("extract_media_url", { url: queue[0].url });
        } catch (e) {
            return console.log(`Error: ${e}`);
        }

        // QUEST: should we also clear mplyr before setting it again?
        setSrc(mediaUrl);
        setMplyrEl(BaseMediaPlayer(mplyr, mediaUrl, onPlayHook, onPauseHook, onSeekHook));
        setQueue(queue.slice(1));

        if (mplyr.current !== null) {
            if (mplyr.current.el != null) {
                mplyr.current.el.className += " w-full h-full";
            }
        }
    }, [queue]);

    const on_pausing = async (_: number, payload: Pausing): Promise<void> => {
        if (mplyrState.canPlay) {
            await mplyr.current?.pause();
        }
    }

    const on_resuming = async (_: number, payload: Resuming): Promise<void> => {
        if (mplyrState.canPlay) {
            await mplyr.current?.play();
        }
    }

    const on_enqueued = async (_: number, payload: Enqueued): Promise<void> => {
        console.log("setting queue");
        setQueue(queue.concat({ url: payload.url, submitted_by: payload.submitted_by } as MediaInfo));
        flushSync(() => { }); // QUEST: is this even needed?
    }

    const on_dequeued = async (_: number, payload: Dequeued): Promise<void> => {
        setQueue([...queue.slice(0, payload.index), ...queue.slice(payload.index + 1)]);
    }

    const send_hello = (name: string, password?: string): void => {
        rpcman.current?.send_message(nextReqId, "HELLO", { name: name, passwd: password });
        setPendingResponseType((prevMap) => new Map(prevMap.set(nextReqId, "HELLO")));
        setNextReqId(nextReqId + 1);
    }

    const send_enqueue = (url: string): void => {
        rpcman.current?.send_message(nextReqId, "ENQUEUE", { url: url });
        setNextReqId(nextReqId + 1);
    }

    const send_deque = (idx: number): void => {
        rpcman.current?.send_message(nextReqId, "DEQUE", { index: idx });
        setNextReqId(nextReqId + 1);
    }

    const on_seeking = useCallback(async (_: number, payload: Seeking): Promise<void> => {
        mplyrRemoteControl.seek(payload.position);
    }, [mplyrEl, mplyr, mplyrRemoteControl]);

    useEffect(() => {
        // NOTE: never replace the RPCManager when one is set.
        // you may think this is obvious at first, but at a glance
        // it isn't immediately obvious that this function is re-called
        // on re-renders if once of it's dependencies changes
        if (rpcman.current === null) {
            const baseHost = new URL(serverUrl).host;
            rpcman.current = new RPCManager(`wss://${baseHost}/api/v0/theaters/${roomId}/rpc/ws`);
        }
        // TODO: sort through which one of these are pure and don't have dependencies that change
        // NOTE: this resets handlers which have dependencies that can change.
        // this also looks silly, but these functions sometimes pull state from
        // the surrounding function definition, which *typically* is always static.
        // to combat this, whenever it's dependencies change, we swap out the handler,
        // that will reference the new state so it never references stale data.
        rpcman.current.register2("OK", typeof Ok, on_response_ok);
        rpcman.current.register2("RESULTS", typeof Results<unknown>, on_response_res);
        rpcman.current.register2("ERR", typeof Err, on_response_err);
        rpcman.current.register2("JOIN", typeof Join, on_join);
        rpcman.current.register2("NOWPLAYING", typeof NowPlaying, on_nowplaying);
        rpcman.current.register2("PAUSING", typeof Pausing, on_pausing);
        rpcman.current.register2("RESUMING", typeof Resuming, on_resuming);
        rpcman.current.register2("ENQUEUED", typeof Enqueued, on_enqueued);
        rpcman.current.register2("DEQUEUED", typeof Dequeued, on_dequeued);
        rpcman.current.register2("SEEKING", typeof Seeking, on_seeking);

        return () => {
            // .close() only runs if it's not connecting or connected already
            rpcman.current.close();
        }
    }, [on_join, on_nowplaying, on_pausing, on_resuming, on_enqueued, on_dequeued, roomId, on_response_res, queue, mplyrEl, mplyr]);

    // NOTE: extremely stupid underhanded method to get
    // around React Strict Mode stupidity.
    useEffectOnce(() => {
        const timer = setInterval(() => {
            if (!rpcman.current.is_ready()) {
                return
            }
            send_hello("Guest");
            clearInterval(timer);
        }, 10);
    });

    const say_hello = (evt: MouseEventHandler<HTMLButtonElement, MouseEvent>): void => {
        alert(evt);
        send_hello("Anon");
    }

    const check_ready = (evt: MouseEventHandler<HTMLButtonElement, MouseEvent>): void => {
        const readyiness = rpcman.current.is_ready();
        alert(readyiness);
        setSrc("https://download.blender.org/peach/bigbuckbunny_movies/big_buck_bunny_1080p_h264.mov");
    }



    return (
        <main className="bg-zinc-600 text-white min-h-screen grid grid-rows-1 grid-cols-6 grid-flow-col box-border">
            <div className="col-start-1 col-span-5 w-full h-full object-cover">
                {mplyrEl}
            </div>
            <div className="col-span-1">
                <div className="grid grid-rows-1 grid-cols-2 grid-flow-col">
                    <div tabIndex={0} className={(() => {
                        const cls = "hover:bg-slate-400 active:bg-slate-50 focus:bg-white focus:text-black text-3xl text-center";
                        if (sidebarTab === "users") {
                            return cls + " bg-white text-black";
                        }
                        return cls;
                    })()} onClick={(evt

                    ) => {
                        return setSidebarTab("users");
                    }}>
                        Users
                    </div>
                    <div tabIndex={1} className={(() => {
                        const cls = "hover:bg-slate-400 active:bg-slate-50 focus:bg-white focus:text-black text-3xl text-center";
                        if (sidebarTab === "queue") {
                            return cls + " bg-white text-black";
                        }
                        return cls;
                    })()} onClick={(evt) => {
                        return setSidebarTab("queue");
                    }}>
                        Queue
                    </div>
                </div>

                {(() => {
                    switch (sidebarTab) {
                        case "queue":
                            const enqueueRequest: () => void = (evt: React.FormEvent): void => {
                                evt.preventDefault();
                                const formData = new FormData(evt.currentTarget);

                                const formValues = {
                                    url: formData.get("media-url")
                                }

                                send_enqueue(formValues.url);
                                evt.currentTarget.reset();
                            }
                            const queueElems = queue.map(item => {
                                return (
                                    <p key={item.url} >{item.url}</p>
                                )
                            });
                            const reqEl = (
                                <form onSubmit={enqueueRequest}>
                                    <fieldset>
                                        <input name="media-url" type="url" required />
                                        <button type="submit">Request</button>
                                    </fieldset>
                                </form>
                            );
                            return (
                                <div>
                                    {queueElems}
                                    {reqEl}
                                </div>
                            );
                            break;

                        case "users":
                            console.log(users)
                            return users.map(user => {
                                return (
                                    <a key={user} >{user}</a>
                                )
                            });
                            break;

                        default:
                            return (
                                <a>if you see this, something broke</a>
                            )
                            break;
                    }
                })()
                }
            </div >
        </main >
    )
}
