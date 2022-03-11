import { Command } from "../../client/Command";
import { DMContext } from "../../client/Context";
import { flushPlayer } from "../../data/Memory";

export const command = new Command({
    description: "Stops the music and clears the queue",
    category: ":musical_note: Music",
    
    args: [],
    execute: async (context, args, self, client) => {
        if (context instanceof DMContext) {
            context.error("You must be in a guild to use this command")
            return
        }

        const guildMemory = client.getGuildMemory(context.guild)
        const connection = guildMemory.connection

        if (connection == null) {
            await context.reply("I'm not in a voice channel!")
            return
        }

        const player = guildMemory.player
        if (player != null) {
           flushPlayer(player)
            guildMemory.player = undefined
           
        }
    }
})