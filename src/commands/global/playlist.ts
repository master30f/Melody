import { Command } from "../../client/Command"
import { newPlayer, Song } from "../../data/Memory"
import { play } from "../../utils/play"
import playdl from "play-dl"
import { parseEmbed } from "../../utils/parseEmbed"
import _ from "lodash"
import formattedTimeToSeconds from "../../utils/formattedTimeToSeconds"
import getPlaylistLength from "../../utils/getPlaylistLength"
import formatSeconds from "../../utils/formatSeconds"

export const command = new Command({
    aliases: ["pl"],
    description: "Playlist related commands",
    category: ":screwdriver: Configuration",

    subCommands: [
        new Command({
            name: "fromqueue",
            aliases: ["createfromqueue", "makefromqueue", "newfromqueue"],
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
                client.config.guilds[guild.id].playlists[name] = {
                    songs: player.queue,
                    author: message.author.id,
                    name: name,
                }
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
                if (guildMemory.connection == null) {
                    client.runCommand(message, "join", [])
                }

                if (guildMemory.player == null) {
                    guildMemory.player = newPlayer(
                        guildMemory,
                        playlist.songs[0]
                    )
                    guildMemory.player.queue.push(...playlist.songs.slice(1))
                } else {
                    guildMemory.player.queue = playlist.songs
                }

                play(guildMemory.player!)
            },
        }),
        new Command({
            name: "add",
            aliases: ["addsong"],
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
                playlist.songs.push(song)
                await message.reply({
                    embeds: [
                        parseEmbed("addedToQueue", {
                            videoName: song.name,
                            length: song.length,
                            channelName: song.channelName,
                            videoLink: song.url,
                            messageType: `Added to playlist ${playlistName}`,
                            thumbnail: song.thumbnail,
                        }),
                    ],
                })
            },
        }),
        new Command({
            name: "remove",
            aliases: ["removesong"],
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
                const songToBeRemoved = playlist.songs.findIndex(
                    (anotherSong) => song.url == anotherSong.url
                )
                if (songToBeRemoved === -1) {
                    await message.reply("That song is not in the playlist!")
                    return
                }
                playlist.songs.splice(songToBeRemoved, 1)
                await message.reply({
                    embeds: [
                        parseEmbed("addedToQueue", {
                            videoName: song.name,
                            length: song.length,
                            channelName: song.channelName,
                            videoLink: song.url,
                            messageType: `Removed from playlist ${playlistName}`,
                            thumbnail: song.thumbnail,
                        }),
                    ],
                })
            },
        }),
        new Command({
            name: "get",
            aliases: ["view", "show"],
            description: "Shows the songs in a playlist",
            args: [
                {
                    name: "playlist",
                    description: "Name of the playlist",
                    type: "string",
                },
            ],
            execute: async (message, args, self, client) => {
                const playlistName = args.playlist as string

                const guild = message.guild
                if (guild == null) {
                    await message.reply(
                        "You must be in a guild to use this bot!"
                    )
                    return
                }

                const playlist =
                    client.config.guilds[guild.id].playlists[playlistName]

                let totalLengthSecs = 0
                let songsEmbeds: object[] = []
                playlist.songs.forEach((song) => {
                    totalLengthSecs += formattedTimeToSeconds(song.length)

                    songsEmbeds.push(
                        parseEmbed("playlist/song", {
                            videoName: song.name,
                            length: song.length,
                            channelName: song.channelName,
                            videoLink: song.url,
                            thumbnail: song.thumbnail,
                        })
                    )
                })

                const hours = Math.floor(totalLengthSecs / 3600)
                const minutes = Math.floor((totalLengthSecs % 3600) / 60)
                const seconds = Math.floor(((totalLengthSecs % 3600) % 60) / 1)
                const formattedLength = `${
                    hours ? `${hours}:` : ""
                }${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
                await message.reply({
                    embeds: [
                        parseEmbed("playlist", {
                            name: playlist.name,
                            length: formattedLength,
                            author: playlist.author,
                        }),
                        ...songsEmbeds,
                    ],
                })
            },
        }),
        new Command({
            name: "delete",
            description: "Deletes a playlist",
            args: [
                {
                    name: "playlist",
                    description: "Name of the playlist",
                    type: "string",
                },
            ],
            execute: async (message, args, self, client) => {
                const guild = message.guild
                const playlistName = args.playlist as string
                if (guild == null) {
                    await message.reply(
                        "You must be in a guild to use this bot!"
                    )
                    return
                }
                message.reply(`Deleting playlist ${playlistName} `)

                delete client.config.guilds[guild.id].playlists[playlistName]
            },
        }),
        new Command({
            name: "new",
            aliases: ["create", "make"],
            description: "Creates a new empty playlist",
            args: [
                {
                    name: "playlist",
                    description: "Name of the playlist",
                    type: "string",
                },
            ],
            execute: async (message, args, self, client) => {
                const playlistName = args.playlist as string

                const guild = message.guild
                if (guild == null) {
                    await message.reply(
                        "You must be in a guild to use this bot!"
                    )
                    return
                }
                client.config.guilds[guild.id].playlists[playlistName] = {
                    author: message.author.id,
                    name: playlistName,
                    songs: [],
                }
            },
        }),
        new Command({
            name: "list",
            aliases: ["all"],
            description: "Shows all playlists of this server",
            args: [],
            execute: async (message, args, self, client) => {
                const guild = message.guild
                if (guild == null) {
                    await message.reply(
                        "You must be in a guild to use this bot!"
                    )
                    return
                }
                let playlistEmbeds = []
                for (let playlistName in client.config.guilds[guild.id]
                    .playlists) {
                    const playlist =
                        client.config.guilds[guild.id].playlists[playlistName]
                    const playlistEmbed = parseEmbed("playlist/list/playlist", {
                        playlistName: playlistName,
                        playlistLength: formatSeconds(
                            getPlaylistLength(playlist)
                        ),
                        playlistAuthor: playlist.author,
                        songNum: playlist.songs.length,
                    })
                    playlistEmbeds.push(playlistEmbed)
                }
                const playlistNum = Object.values(client.config.guilds[guild.id].playlists).length
                const embed = parseEmbed("playlist/list", {
                    playlistNum: playlistNum,
                    playlists: playlistEmbeds,
                    s: playlistNum == 1 ? "" : "s"
                })
                await message.reply({
                    embeds: [embed]
                })
            },
        }),
    ],

    args: [],
    execute: async () => {},
})
