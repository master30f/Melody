import { Command } from "../../client/Command";
import { newPlayer, Song } from "../../data/Memory";
import { play } from "../../utils/play";
import playdl from "play-dl"
import { parseEmbed } from "../../utils/parseEmbed"
import _ from "lodash"

export const command = new Command({
    aliases: ["pl"],
    description: "Playlist related commands",
    category: ":screwdriver: Configuration",

    subCommands: [
        new Command({
            name: "new",
            description: "Creates a new playlist from the current queue",
            args: [
                {
                    name: "name",
                    description: "Name of the new playlist",
                    type: "string",
                },
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
            },
        }),
        new Command({
            name: "play",
            description: "Plays a given playlist",
            args: [
                {
                    name: "name",
                    description: "Name of the playlist",
                    type: "string",
                },
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
        }),
        new Command({
            name: "add",
            aliases: [ "addsong" ],
            description: "Adds a song to the given playlist",
            args: [
                {
                    name: "playlist",
                    description: "Name of the playlist",
                    type: "string",
                },
                {
                    name: "song",
                    description: "Name of the song",
                    type: "string...",
                },
            ],
            execute: async (message, args, self, client) => {
                const playlistName = args.playlist as string
                const songName = args.song as string

                const guild = message.guild
                if (guild == null) {
                    await message.reply(
                        "You must be in a guild to use this bot!"
                    )
                    return
                }
                const playlist =
                    client.config.guilds[guild.id].playlists[playlistName]
                const songSearch = (await playdl.search(songName))[0]

                const song: Song = {
                    url: songSearch.url,
                    name: songSearch.title || "",
                    channelName: songSearch.channel?.name || "",
                    length: songSearch.durationRaw,
                    thumbnail: songSearch.thumbnails[0].url,
                }
                playlist.push(song)
                await message.reply({
                    embeds: [parseEmbed("addedToQueue", {
                        videoName: song.name,
                        length: song.length,
                        channelName: song.channelName,
                        videoLink: song.url,
                        messageType: `Added to playlist ${playlistName}`,
                        thumbnail: song.thumbnail
                    })]
                })
            },
        }),
        new Command({
            name: "remove",
            aliases: [ "removesong"],
            description: "Removes a song from the given playlist",
            args: [
                {
                    name: "playlist",
                    description: "Name of the playlist",
                    type: "string",
                },
                {
                    name: "song",
                    description: "Name of the song",
                    type: "string...",
                },
            ],
            execute: async (message, args, self, client) => {
                const playlistName = args.playlist as string
                const songName = args.song as string

                const guild = message.guild
                if (guild == null) {
                    await message.reply(
                        "You must be in a guild to use this bot!"
                    )
                    return
                }
                const playlist =
                    client.config.guilds[guild.id].playlists[playlistName]
                const songSearch = (await playdl.search(songName))[0]

                const song: Song = {
                    url: songSearch.url,
                    name: songSearch.title || "",
                    channelName: songSearch.channel?.name || "",
                    length: songSearch.durationRaw,
                    thumbnail: songSearch.thumbnails[0].url,
                }            
                const songToBeRemoved = playlist.findIndex((anotherSong) => song.url == anotherSong.url)
                if (songToBeRemoved === -1){
                    await message.reply("That song is not in the playlist!")
                    return
                }
                playlist.splice(songToBeRemoved, 1)
                await message.reply({
                    embeds: [parseEmbed("addedToQueue", {
                        videoName: song.name,
                        length: song.length,
                        channelName: song.channelName,
                        videoLink: song.url,
                        messageType: `Removed from playlist ${playlistName}`,
                        thumbnail: song.thumbnail
                    })]
                })
            }
        })
    ],

    args: [],
    execute: async () => {},
})
