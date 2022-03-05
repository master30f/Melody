import { Command } from "../../client/Command";
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
    execute: async (message, args, self, client) => {
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
            await message.reply("There is no song to skip!")
            return
        }

        const justPlayed = player.queue.shift()
        if (player.loop && justPlayed != null) player.queue.push(justPlayed)
        if (player.queue.length !== 0) {
            const song = player.queue[0]
            await message.reply({
                embeds: [parseEmbed("addedToQueue", {
                    videoName: song.name,
                    length: song.length,
                    channelName: song.channelName,
                    videoLink: `https://youtu.be/${song.id}`,
                    messageType: "Currently playing",
                    thumbnail: song.thumbnail
                })]
            })
            await play(player)
        }
        else {
            flushPlayer(player)
            guildMemory.player = undefined
        }
    }
})