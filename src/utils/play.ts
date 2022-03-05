import { createAudioResource } from "@discordjs/voice";
import ytdl from "ytdl-core";
import { Player } from "../data/Memory";

export async function play(player: Player) {
    const queue = player.queue

    const stream = ytdl(queue[0].id, {
        filter: "audioonly",
    })
    const resource = createAudioResource(stream)
    player.subscription.player.play(resource)
}