import { Command } from "../../client/Command";

export const command = new Command({
    aliases: [
        "le"
    ],
    description: "Leaves the voice channel",
    category: ":tools: Miscellaneous",
    
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
            message.reply("I'm not in a voice channel!")
            return
        }

        client.runCommand(message, "stop", [])

        connection.disconnect()
        guildMemory.connection = undefined
    } // execute
}) // command