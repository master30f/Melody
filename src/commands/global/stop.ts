import { Command } from "../../client/Command";
import { flushPlayer } from "../../data/Memory";

export const command = new Command({
    description: "Stops the music and clears the queue",
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
        const connection = guildMemory.connection

        if (connection == null) {
            await message.reply("I'm not in a voice channel!")
            return
        }

        const player = guildMemory.player
        if (player != null) {
            flushPlayer(player)
            guildMemory.player = undefined
        }
    }
})