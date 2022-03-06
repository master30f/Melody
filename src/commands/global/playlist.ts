import { Command } from "../../client/Command";
import { newPlayer } from "../../data/Memory";
import { play } from "../../utils/play";

export const command = new Command({
    aliases: [
        "pl"
    ],
    description: "Playlist related commands",
    category: ":screwdriver: Configuration",
    
    subCommands: [
        new Command({
            name: "new",
            description: "Creates a new playlist",
            args: [
                {
                    name: "name",
                    description: "Name of the new playlist",
                    type: "string"
                }
            ],
            execute: async (message, args, self, client) => {
                const name = args.name as string

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
                    await message.reply("There are no songs to save!")
                    return
                }

                if (client.config.guilds[guild.id].playlists == null) {
                    client.config.guilds[guild.id].playlists = {}
                }
                client.config.guilds[guild.id].playlists[name] = player.queue
            }
        }),
        new Command({
            name: "play",
            description: "Plays a given playlist",
            args: [
                {
                    name: "name",
                    description: "Name of the playlist",
                    type: "string"
                }
            ],
            execute: async (message, args, self, client) => {
                const name = args.name as string

                const guild = message.guild
                if (guild == null) {
                    await message.reply(
                        "You must be in a guild to use this bot!"
                    )
                    return
                }

                const playlist = client.config.guilds[guild.id].playlists[name]

                const guildMemory = client.getGuildMemory(guild)

                if (guildMemory.player == null) {
                    guildMemory.player = newPlayer(guildMemory, playlist[0])
                    guildMemory.player.queue.push(...playlist.slice(1))
                }
                else {
                    guildMemory.player.queue = playlist
                }

                play(guildMemory.player!)
            }
        })
    ],

    args: [],
    execute: async () => {

    }
})