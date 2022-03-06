import { Command } from "../../client/Command"
import { newPlayer, Song } from "../../data/Memory"
import { parseEmbed } from "../../utils/parseEmbed"
import { play } from "../../utils/play"
import playdl from "play-dl"

export const command = new Command({
    aliases: [
        "p"
    ],
    description: "Searches for and plays a song from YouTube",
    category: ":musical_note: Music",
    
    args: [{
        name: "querry",
        description: "Name or link of the song",
        type: "string...",
    }],
    execute: async (message, args, self, client) => {
        const videoQuerry = args.querry as string

        const guild = message.guild
        if (guild == null) {
            await message.reply(
                "You must be in a server to use this bot!"
            )
            return
        }

        const guildMemory = client.getGuildMemory(guild)

        if (guildMemory.connection == null) {
            client.runCommand(message, "join", [])
        }

        const songSearch = (await playdl.search(videoQuerry))[0]

        const song: Song = {
            url: songSearch.url,
            name: songSearch.title || "",
            channelName: songSearch.channel?.name || "",
            length: songSearch.durationRaw,
            thumbnail: songSearch.thumbnails[0].url
        }
        
        if (guildMemory.player == null) {
            guildMemory.player = newPlayer(guildMemory, song)
        }
        else {
            guildMemory.player.queue.push(song)
        }

        const player = guildMemory.player!
        const queue = player.queue

        if (queue.length === 1) {
            await message.reply({
                embeds: [parseEmbed("addedToQueue", {
                    videoName: song.name,
                    length: song.length,
                    channelName: song.channelName,
                    videoLink: song.url,
                    messageType: "Currently playing",
                    thumbnail: song.thumbnail
                })]
            })
            await play(player)
        }
        else {
            await message.reply({
                embeds: [parseEmbed("addedToQueue", {
                    videoName: song.name,
                    length: song.length,
                    channelName: song.channelName,
                    videoLink: song.url,
                    messageType: "Added to queue",
                    thumbnail: song.thumbnail
                })]
            })
        }
    }
})