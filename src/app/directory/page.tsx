"use client";

import React, { useEffect, useState } from 'react';
import { useMutableStore } from '@/utils/store';
import { useRouter } from 'next/navigation';
import { TheatersApi, TheaterMinimal, Configuration } from '@/cinema';

export default function Directory() {
    const router = useRouter();
    let [theaters, setTheaters] = useState(new Array());

    const serverUrl = useMutableStore((state) => state.server);
    const setRoomId = useMutableStore((state) => state.setRoomId);

    const refreshRooms = async () => {
        setTheaters((await (new TheatersApi(new Configuration({ basePath: serverUrl }))).listTheatersApiV0TheatersGet()).data);
    }

    const joinRoom = (id: string) => {
        setRoomId(id);
        router.push(`/directory/theater`);
    }


    useEffect(() => {
        (async () => {
            setTheaters((await (new TheatersApi(new Configuration({ basePath: serverUrl }))).listTheatersApiV0TheatersGet()).data);
        })()
    }, [setTheaters, serverUrl]);

    return (
        <main className="bg-zinc-600 min-h-screen">
            <div className="grid grid-rows-2 grid-flow-col gap-16">
                {theaters.map((room: TheaterMinimal, idx: number) => {
                    return (
                        <div className="relative outline h-24 bg-white p-2 m-2" key={room.id}>
                            <div className="absolute left-0 top-0">
                                {room.name}
                            </div>

                            <div className="absolute bottom-0 left-0">
                                {room.occupancy}/{room.seats}
                            </div>

                            <div className="absolute bottom-0 right-0">
                                <button type="button" onClick={(evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => joinRoom(room.id)}>Join</button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </main>
    )
}
