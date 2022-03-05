import { AudioPlayerStatus, createAudioPlayer, PlayerSubscription, VoiceConnection } from "@discordjs/voice";
import { play } from "../utils/play";

export interface Song {
    name: string
    channelName: string
    id: string
    thumbnail: string
    length: string
}

export function flushPlayer(player: Player) {
    if (player.subscription != null) {
        player.subscription.unsubscribe()
    }
}

export function newPlayer(memory: LocalMemory, song: Song): Player {
    const player: Player = {
        loop: false,
        queue: [song],
        subscription: memory.connection!.subscribe(createAudioPlayer())!
    }

    player.subscription.player.on(AudioPlayerStatus.Idle, async () => {
        const justPlayed = player.queue.shift()
        if (player.loop && justPlayed != null) player.queue.push(justPlayed)
        if (player.queue.length !== 0) {
            await play(player)
        }
        else {
            flushPlayer(player)
            memory.player = undefined
        }
    })

    player.subscription.player.on("error", async () => {
        setTimeout(async () => {
            await play(player)
        }, 250)
    })

    return player
}

export interface Player {
    queue: Song[],
    loop: boolean,
    subscription: PlayerSubscription
}

export interface LocalMemory {
    connection: VoiceConnection | undefined
    player: Player | undefined
}

interface Guilds {
    [propName: string]: LocalMemory
}

export interface Memory {
    guilds: Guilds
}