import {
    AudioPlayerPausedState,
    AudioPlayerPlayingState,
    AudioPlayerState,
    AudioPlayerStatus,
} from "@discordjs/voice"
import { Command } from "../../client/Command"
import { DMContext } from "../../client/Context"
import formattedTimeToSeconds from "../../utils/formattedTimeToSeconds"
import { parseEmbed } from "../../utils/parseEmbed"

function isStateValid(
    state: AudioPlayerState
): state is AudioPlayerPlayingState | AudioPlayerPausedState {
    return [
        AudioPlayerStatus.Playing,
        AudioPlayerStatus.Paused,
        AudioPlayerStatus.AutoPaused,
    ].includes(state.status)
}
export const command = new Command({
    aliases: ["q", "que"],
    description: "Queue related commands",
    category: ":musical_note: Music",

    subCommands: [
        new Command({
            name: "get",
            aliases: ["view", "show"],
            description: "Shows the queue",
            args: [],
            execute: async (context, args, self, client) => {
                if (context instanceof DMContext) {
                    context.error("You must be in a guild to use this command")
                    return
                }

                const guildMemory = client.getGuildMemory(context.guild)

                const player = guildMemory.player
                if (player == null) {
                    context.reply("The queue does not exist!")
                    return
                }

                let totalLengthSecs = 0
                let songsEmbeds: object[] = []

                const state = player.subscription.player.state
                if (isStateValid(state)) {
                    const songLength = formattedTimeToSeconds(
                        player.queue[0].length
                    )
                    const remainingTime =
                        songLength - Math.floor(state.playbackDuration / 1000)
                    totalLengthSecs += remainingTime
                }

                player.queue.slice(1).forEach((song) => {
                    // "45:21" => ["45", "21"] => [45, 21]
                    const secs = formattedTimeToSeconds(song.length)

                    const hours = Math.floor(totalLengthSecs / 3600)
                    const minutes = Math.floor((totalLengthSecs % 3600) / 60)
                    const seconds = Math.floor(
                        ((totalLengthSecs % 3600) % 60) / 1
                    )
                    const formattedLength = `${
                        hours ? `${hours}:` : ""
                    }${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`

                    songsEmbeds.push(
                        parseEmbed("queue/song", {
                            videoName: song.name,
                            length: song.length,
                            channelName: song.channelName,
                            videoLink: song.url,
                            thumbnail: song.thumbnail,
                            timeUntil: formattedLength,

                        })
                    )
                    totalLengthSecs += secs
                })

                const hours = Math.floor(totalLengthSecs / 3600)
                const minutes = Math.floor((totalLengthSecs % 3600) / 60)
                const seconds = Math.floor(((totalLengthSecs % 3600) % 60) / 1)
                const formattedLength = `${
                    hours ? `${hours}:` : ""
                }${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`

                const songNum1 = player.queue[0]

                await context.message.reply({
                    embeds: [
                        parseEmbed("queue", {
                            length: songNum1.length,
                            videoName: songNum1.name,
                            channelName: songNum1.channelName,
                            videoLink: songNum1.url,
                            thumbnail: songNum1.thumbnail,
                            loopingStatus: player.loop ? ":repeat: Looping enabled" : ":no_entry_sign: Looping disabled",
                            queueLength: formattedLength
                        }),
                        ...songsEmbeds,
                    ],
                })
            },
        }),
        /*new Command({
            name: "add",
            description: "Adds a song to the queue", 
            args: [{
                name: "song",
                description: "Name or link of the song",
                type: "string..."
            }],
            execute: async (message, args, self, client) => {
                const song = args.song as string

                const guild = message.guild
                if (guild == null) {
                    await message.reply(
                        "You must be in a guild to use this bot!"
                    )
                    return
                }

                const guildMemory = client.getGuildMemory(guild)

                const player = guildMemory.player
                if (player == null) {
                    message.reply("Cannot add a song to the queue because the queue does not exist!")
                    return
                }

                player.queue.push(song)
            }
        }),*/
        new Command({
            name: "clear",
            description: "Clears the queue",
            args: [],
            execute: async (context, args, self, client) => {
                const song = args.song as string

                if (context instanceof DMContext) {
                    context.error("You must be in a guild to use this command")
                    return
                }

                const guildMemory = client.getGuildMemory(context.guild)

                const player = guildMemory.player
                if (player == null) {
                    context.reply(
                        "Cannot clear the queue because the queue does not exist!"
                    )
                    return
                }

                player.queue = []
            },
        }),
    ],

    args: [],
    execute: async (context, args, self, client) => {
        const getCommand = self.subCommand("get")!
        await getCommand.execute(context, args, self, client)
    },
})
