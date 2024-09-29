"use client";

import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useMutableStore, useConfigStore } from '@/utils/store';
const semver = require("semver");

interface ReleaseInfo {
    stable: string
}


export default function Home() {
    // HACK: such an egregious hack because of Tauri developers, and 
    // their refusal to fix this outside of Tauri v2.
    const [fs, setFsLib] = useState(null);
    useEffect(() => {
        (async () => {
            const fsLib = (await import("@tauri-apps/api"))?.fs;
            setFsLib(fsLib);
        })();
    }, []);

    const router = useRouter();
    const setServerUrl = useMutableStore((state) => state.setServer);
    const appConfig = useConfigStore((state) => state);

    const [outdated, setAppOutdated] = useState(false);

    const loadConfig = useCallback(async () => {
        if (!fs) { return; }
        if (await fs.exists("config.json", { dir: fs.BaseDirectory.AppLocalData })) {
            const contents = await fs.readTextFile("config.json", { dir: fs.BaseDirectory.AppLocalData });
            appConfig.setConfig(JSON.parse(contents));
        }
        // TODO: migrate to different config formats here
    }, [appConfig, fs]);

    const saveConfig = useCallback(async () => {
        if (!fs) { return; }
        await fs.writeTextFile("config.json", JSON.stringify(appConfig, undefined, 4), { dir: fs.BaseDirectory.AppLocalData });
    }, [appConfig, fs]);

    const connectToServer: () => void = (evt: React.FormEvent): void => {
        evt.preventDefault();
        const formData = new FormData(evt.currentTarget);

        const formValues = {
            server: formData.get("server-address")
        }
        setServerUrl(formValues.server);
        router.push("/directory");
    }

    useEffect(() => {
        (async () => {
            await loadConfig();
            await saveConfig();
        })();
    }, [fs]);

    useEffect(() => {
        (async () => {
            const resp = await fetch("https://raw.githubusercontent.com/Starz0r/cinema-desktop/refs/heads/master/.meta/.releases.json");
            const releaseInfo: ReleaseInfo = JSON.parse(await resp.text());
            if ((semver.valid(releaseInfo.stable)) && (semver.valid(process.env.NEXT_PUBLIC_APP_VERSION))) {
                if (semver.gt(releaseInfo.stable, process.env.NEXT_PUBLIC_APP_VERSION)) {
                    setAppOutdated(true);
                }
            }
        })();
    }, []);

    return (
        <main className="bg-zinc-600 flex min-h-screen min-w-[100vw] justify-center items-center text-white leading-6 box-border">
            <form onSubmit={connectToServer}>
                <fieldset>
                    <legend className="text-center p-2 m-2">Server Connection</legend>
                    <div className="p-1 m-2">
                        <label htmlFor="server-address">Enter a server address: </label>
                        <input className="text-[#333333]" name="server-address" type="url" placeholder="https://example.com" required autoFocus />
                    </div>
                    <div className="p-1">
                        <button className="appearance-button" type="submit" name="connect" value="Connect">Connect</button>
                    </div>
                </fieldset>
            </form>
            {outdated ? (
                <p className="absolute font-extrabold text-3xl text-amber-300 place-self-end">
                    The application is outdated! Please install the latest version from{" "}
                    <a href="https://github.com/Starz0r/cinema-desktop/releases">
                        here!
                    </a>
                </p>) : (<></>)}
        </main>
    );
}
