import { Command } from "../../client/Command";
import { DMContext } from "../../client/Context";

export const command = new Command({
    aliases: [
        "loopqueue",
        "l"
    ],
    description: "Toggles queue looping",
    category: ":musical_note: Music",
    
    args: [],
    execute: async (context, args, self, client) => {
        if (context instanceof DMContext) {
            context.error("You must be in a guild to use this command")
            return
        }

        const guildMemory = client.getGuildMemory(context.guild)

        if (guildMemory.player == null) {
            await context.reply("The queue is empty!")
            return
        }
        const player = guildMemory.player!

        player.loop = !player.loop
        context.reply(`Queue looping is set to ${player.loop}`)
    }
})