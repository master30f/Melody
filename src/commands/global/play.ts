import { Command } from "../../client/Command"
import { newPlayer, Song } from "../../data/Memory"
import { parseEmbed } from "../../utils/parseEmbed"
import { play } from "../../utils/play"
import playdl from "play-dl"
import { DMContext } from "../../client/Context"

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
    execute: async (context, args, self, client) => {
        const videoQuerry = args.querry as string

        if (context instanceof DMContext) {
            context.error("You must be in a guild to use this command")
            return
        }

        const guildMemory = client.getGuildMemory(context.guild)

        if (guildMemory.connection == null) {
            client.runCommand(context.message, "join", [])
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
            await context.replyEmbed(
                parseEmbed("addedToQueue", {
                    videoName: song.name,
                    length: song.length,
                    channelName: song.channelName,
                    videoLink: song.url,
                    messageType: "Currently playing",
                    thumbnail: song.thumbnail
                })
            )
            await play(player)
        }
        else {
            await context.replyEmbed(
                parseEmbed("addedToQueue", {
                    videoName: song.name,
                    length: song.length,
                    channelName: song.channelName,
                    videoLink: song.url,
                    messageType: "Added to queue",
                    thumbnail: song.thumbnail
                })
            )
        }
    }
})