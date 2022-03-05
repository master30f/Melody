import { Command } from "../../client/Command";

export const command = new Command({
    aliases: [
        "loopqueue",
        "l"
    ],
    description: "Toggles queue looping",
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

        if (guildMemory.player == null) {
            await message.reply("The queue is empty!")
            return
        }
        const player = guildMemory.player!

        player.loop = !player.loop
        message.reply(`Queue looping is set to ${player.loop}`)
    }
})