import { create } from 'zustand';

export const useMutableStore = create((set, get) => ({
    server: "https://example.com",
    roomId: "",
    setServer: (server: string) => {
        set({ server: server })
    },
    setRoomId: (roomId: string): void => {
        set({ roomId: roomId });
    }
}));

export const useConfigStore = create((set, get) => ({
    configFormat: 0,
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
    setConfig: (cfg: any): void => {
        set(cfg);
    }
}));
