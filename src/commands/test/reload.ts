import { Command } from "../../client/Command";

export const command = new Command({
    description: "Reboots the bot",
    
    args: [],
    execute: async (context, args, self, client) => {
        await context.reply(`Reloading...`)
        await client.onReady()
        await context.reply(`Reloaded!`)
    }
})