import { createAudioResource } from "@discordjs/voice";
import playdl from "play-dl";
import { Player } from "../data/Memory";

export async function play(player: Player) {
    const queue = player.queue

    const stream = await playdl.stream(queue[0].url)
    const resource = createAudioResource(stream.stream, {
        inputType: stream.type
    })
    player.subscription.player.play(resource)
}