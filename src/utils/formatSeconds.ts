export default function formatSeconds(secondsIn: number): string {
    const hours = Math.floor(secondsIn / 3600)
    const minutes = Math.floor((secondsIn % 3600) / 60)
    const seconds = Math.floor(((secondsIn % 3600) % 60) / 1)
    const formattedLength = `${hours ? `${hours}:` : ""}${minutes}:${
        seconds < 10 ? `0${seconds}` : seconds
    }`
    return formattedLength
}
