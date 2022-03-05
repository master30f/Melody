import { Song } from "./Memory";

export interface Settings {
    prefix: string | string[]
}

export interface Playlists {
    [propName: string]: Song[]
}

export interface Guild {
    settings: Settings,
    playlists: Playlists
}

interface Guilds {
    [propName: string]: Guild
}

export interface Config {
    guilds: Guilds,
    settings: Settings
}