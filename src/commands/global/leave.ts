import { Command } from "../../client/Command";
import { DMContext } from "../../client/Context";

export const command = new Command({
    aliases: [
        "le"
    ],
    description: "Leaves the voice channel",
    category: ":tools: Miscellaneous",
    
    args: [],
    execute: async (context, args, self, client) => {
        if (context instanceof DMContext) {
            context.error("You must be in a guild to use this command")
            return
        }

        const guildMemory = client.getGuildMemory(context.guild)
        const connection = guildMemory.connection

        if (connection == null) {
            context.reply("I'm not in a voice channel!")
            return
        }

        client.runCommand(context.message, "stop", [])

        connection.disconnect()
        guildMemory.connection = undefined
    } // execute
}) // command