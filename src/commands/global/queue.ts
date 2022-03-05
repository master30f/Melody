import { Command } from "../../client/Command";

export const command = new Command({
    aliases: [
        "q"
    ],
    description: "Queue related commands",
    category: ":musical_note: Music",
    
    subCommands: [
        new Command({
            name: "get",

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
                    message.reply("The queue does not exist!")
                    return
                }

                await message.reply(`Queue:\n${player.queue}`)
            }
        }),
        /*new Command({
            name: "add",

            args: [{
                name: "song",
                type: "string..."
            }],
            execute: async (message, args, self, client) => {
                const song = args.song as string

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
                    message.reply("Cannot add a song to the queue because the queue does not exist!")
                    return
                }

                player.queue.push(song)
            }
        }),*/
        new Command({
            name: "clear",

            args: [],
            execute: async (message, args, self, client) => {
                const song = args.song as string

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
                    message.reply("Cannot clear the queue because the queue does not exist!")
                    return
                }

                player.queue = []
            }
        })
    ],

    args: [],
    execute: async (message, args, self, client) => {
        const getCommand = self.subCommand("get")!
        await getCommand.execute(message, args, self, client)
    }
})