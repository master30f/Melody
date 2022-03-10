import { fromPairs } from "lodash"
import { Playlist } from "../data/Config"
import formattedTimeToSeconds from "./formattedTimeToSeconds"

export default function getPlaylistLength(playlist: Playlist): number {
    let totalLengthSecs = 0
    playlist.songs.forEach((song) => {
        totalLengthSecs += formattedTimeToSeconds(song.length)
    })
    return totalLengthSecs
}
