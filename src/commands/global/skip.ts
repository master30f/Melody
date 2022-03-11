import { Command } from "../../client/Command";
import { DMContext } from "../../client/Context";
import { flushPlayer } from "../../data/Memory";
import { parseEmbed } from "../../utils/parseEmbed";
import { play } from "../../utils/play";

export const command = new Command({
    aliases: [
        "s"
    ],
    description: "Skips the current song",
    category: ":musical_note: Music",
    
    args: [],
    execute: async (context, args, self, client) => {
        if (context instanceof DMContext) {
            context.error("You must be in a guild to use this command")
            return
        }

        const guildMemory = client.getGuildMemory(context.guild)

        const player = guildMemory.player
        if (player == null) {
            await context.reply("There is no song to skip!")
            return
        }

        const justPlayed = player.queue.shift()
        if (player.loop && justPlayed != null) player.queue.push(justPlayed)
        if (player.queue.length !== 0) {
            const song = player.queue[0]
            await context.replyEmbed(
                parseEmbed("addedToQueue", {
                    videoName: song.name,
                    length: song.length,
                    channelName: song.channelName,
                    videoLink: song.url,
                    messageType: "Currently playing",
                    thumbnail: song.thumbnail,
                })
            )
            await play(player)
        }
        else {
            flushPlayer(player)
            guildMemory.player = undefined
        }
    }
})