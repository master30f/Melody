import { Song } from "./Memory";

export interface Settings {
    prefix: string | string[]
}

export interface Playlist {
    songs: Song[],
    author: string,
    name: string
}

export interface Playlists {
    [propName: string]: Playlist
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