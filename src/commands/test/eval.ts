import { Command } from "../../client/Command";

export const command = new Command({
    description: "",
    
    args: [{
        name: "expression",
        type: "string..."
    }],
    execute: async (message, args, self, client) => {
        const expr = args.expression as string

        const guild = message.guild!
        const guildMemory = client.getGuildMemory(guild)
        const player = guildMemory.player
        const queue = player?.queue
        const connection = guildMemory.connection
        
        message.reply(`${eval(expr)}`)
    }
})