import { Command } from "../../client/Command";

export const command = new Command({
    aliases: [
        "latency",
        "pong"
    ],
    description: "Shows the bot's ping",
    category: ":tools: Miscellaneous",
    
    args: [],
    execute: async (context) => {
        context.reply(`Current ping is ${Date.now() - context.message.createdTimestamp}ms`)
    }
})