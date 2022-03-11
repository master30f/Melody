import { Command } from "../../client/Command";
import { DMContext } from "../../client/Context";

export const command = new Command({
    aliases: [
        "pa"
    ],
    description: "Pauses the music",
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
            await context.reply("Nothing is playing!")
            return
        }

        player.subscription.player.pause(true)
    }
})