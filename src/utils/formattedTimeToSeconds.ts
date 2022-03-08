export default function formattedTimeToSeconds(time: string): number {
    let secs = 0
    const pieces = time.split(":").map((piece) => Number.parseInt(piece))
    if (pieces.length === 2) {
        pieces.unshift(0)
    }
    secs += pieces[0] * 3600
    secs += pieces[1] * 60
    secs += pieces[2] * 1
    return secs
}
