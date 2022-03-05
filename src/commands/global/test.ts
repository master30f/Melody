import { Command } from "../../client/Command";

export const command = new Command({
    description: "Shows the guild name",
    category: ":tools: Miscellaneous",
    
    subCommands:[
        new Command({
            name: "subcommand",
            description: "tells you it's a subcommand",
            args: [],
            execute: async (message) => {
                message.channel.send(`das ist ein SUBCOMMANDEN!<@${message.author.id}>`)
            }

        })
    ], 

    args: [],
    execute: async (message) => {
        message.reply(`<@${message.author.id}>, you suck`)
    }
})