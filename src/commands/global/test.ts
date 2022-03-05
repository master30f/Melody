import { Command } from "../../client/Command";

export const command = new Command({
    description: "Shows the guild name",
    category: ":tools: Miscellaneous",
    
    args: [],
    execute: async (message) => {
        message.reply(`Name is: ${message.guild!.name}`)
    }
})