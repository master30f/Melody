import { Command } from "../../client/Command";

export const command = new Command({
    aliases: [
        "pa"
    ],
    description: "Pauses the music",
    category: ":musical_note: Music",
    
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

        const player = guildMemory.player
        if (player == null) {
            await message.reply("Nothing is playing!")
            return
        }

        player.subscription.player.pause(true)
    }
})