import { Command } from "../../client/Command";
import { DMContext } from "../../client/Context";

export const command = new Command({
    description: "Prefix related commands",
    category: ":screwdriver: Configuration",

    subCommands: [
        new Command({
            name: "set",
            description: "Sets a prefix",
            args: [
                {
                    name: "prefix",
                    description: "A short word or character that will be used to trigger the bot",
                    type: "string..."
                }
            ],
            execute: async (context, args, self, client) => {
                if (context instanceof DMContext) {
                    context.error("You must be in a guild to use this command")
                    return
                }
                
                const prefix = args.prefix as string

                client.getGuildSettings(context.guild).prefix = prefix
                await context.reply(`Prefix has been set to \`${prefix}\``)
            }
        }),
        new Command({
            name: "get",
            aliases: [
                "view",
                "show"
            ],
            description: "Shows the current prefix",
            args: [],
            execute: async (context, args, self, client) => {
                if (context instanceof DMContext) {
                    context.error("You must be in a guild to use this command")
                    return
                }

                await context.reply(`Current prefix is \`${client.getPrefix(context.guild)}\``)
            }
        }),
        new Command({
            name: "add",
            description: "Adds a prefix",
            args: [
                {
                    name: "prefix",
                    description: "A short word or character that will be used to trigger the bot",
                    type: "string..."
                }
            ],
            execute: async (context, args, self, client) => {
                if (context instanceof DMContext) {
                    context.error("You must be in a guild to use this command")
                    return
                }

                const prefix = args.prefix as string

                const settings = client.getGuildSettings(context.guild)
                const prfx = settings.prefix
                if (typeof prfx === "string") {
                    settings.prefix = [prfx, prefix]
                } else {
                    (settings.prefix as string[]).push(prefix)
                }

                await context.reply(`Added prefix \`${prefix}\``)
            }
        }),
        new Command({
            name: "remove",
            description: "Removes a prefix",
            args: [
                {
                    name: "prefix",
                    description: "The prefix you want to remove",
                    type: "string..."
                }
            ],
            execute: async (context, args, self, client) => {
                if (context instanceof DMContext) {
                    context.error("You must be in a guild to use this command")
                    return
                }

                const prefix = args.prefix as string

                const settings = client.getGuildSettings(context.guild)
                const prfx = settings.prefix
                if (typeof prfx === "string") {
                    if (prfx !== prefix) {
                        await context.reply(`Can not remove prefix \`${prefix}\``)
                        return
                    }
                    settings.prefix = client.config.settings.prefix
                } else {
                    let target = (settings.prefix as string[]).findIndex((value) => {value === prefix})
                    if (target === -1) {
                        await context.reply(`Can not remove prefix \`${prefix}\``)
                        return
                    }
                    (settings.prefix as string[]).splice(target, 1)
                }

                await context.reply(`Added prefix \`${prefix}\``)
            }
        })
    ],

    args: [
        {
            name: "prefix",
            type: "string...",
            optional: true
        }
    ],
    execute: async (context, args, self, client) => {
        if (context instanceof DMContext) {
            context.error("You must be in a guild to use this command")
            return
        }

        const argument = args.prefix as string | undefined

        if (argument == null) {
            const getCommand = self.subCommand("get")!
            await getCommand.execute(context, args, self, client)
        } else {
            const setCommand = self.subCommand("set")!
            await setCommand.execute(context, args, self, client)
        }
    }
})