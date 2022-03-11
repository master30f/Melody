import { CommandInteractionOptionResolver } from "discord.js"
import { Command } from "../../client/Command"
import { DMContext } from "../../client/Context"
import { parseEmbed } from "../../utils/parseEmbed"

export const command = new Command({
    description: "Shows this message",
    category: ":tools: Miscellaneous",

    args: [
        {
            name: "command",
            type: "string",
            description: "The command you need help with",
            optional: true,
        },
    ],
    execute: async (context, args, self, client) => {
        const cmd = args.command as string | undefined

        if (context instanceof DMContext) {
            context.error("You must be in a guild to use this command")
            return
        }

        if (cmd != null) {
            let command = client.globalCommands.get(cmd)

            if (command != null) {
                const prefix = client.getPrefix(context.guild)

                const argsEmbed = parseEmbed("help/command/arguments", {
                    arguments: command.args
                        .map(
                            (arg) =>
                                `\`${arg.optional ? "[" : "<"}${arg.name}${
                                    arg.optional ? "]" : ">"
                                }\` **${arg.type}**${
                                    arg.description
                                        ? ` *${arg.description}*`
                                        : ""
                                }`
                        )
                        .join("\n"),
                })

                const subsEmbed = parseEmbed("help/command/subcommands", {
                    subcommands: (command.subCommands || [])
                        .map((subCommand) => {
                            let argReps: string[] = []

                            for (const arg of subCommand.args) {
                                argReps.push(
                                    arg.optional
                                        ? `[${arg.name}]`
                                        : `<${arg.name}>`
                                )
                            }

                            const args: string = argReps.join(" ")

                            return `**${subCommand.name}** ${
                                args ? `\`${args}\` ` : ""
                            }${
                                subCommand.description
                                    ? `*${subCommand.description}*`
                                    : ""
                            }${subCommand.subCommands ? " :book:" : ""}`
                        })
                        .join("\n"),
                })

                let fields = []
                if (command.args.length > 0) fields.push(argsEmbed)
                if (command.subCommands && command.subCommands.length > 0)
                    fields.push(subsEmbed)

                await context.replyEmbed(
                    parseEmbed("help/command", {
                        name: command.name!,
                        description: command.description || "None",
                        category: command.category || "None",
                        aliases: command.aliases
                            ? command.aliases.join(", ")
                            : "None",
                        fields: fields,
                        prefix: typeof prefix == "string" ? prefix : prefix[0],
                    })
                )
            } else {
                await context.reply(`Could not find command ${cmd}`)
            }
        } else {
            const categories: Map<string, Command[]> = new Map()
            for (const commandName of client.globalCommands.keys()) {
                const command = client.globalCommands.get(commandName)!
                const category = command.category || "Other"
                if (categories.has(category)) {
                    categories.get(category)?.push(command)
                } else {
                    categories.set(category, [command])
                }
            }

            const categoryEmbeds: object[] = []
            for (const categoryName of categories.keys()) {
                const commands = categories.get(categoryName)!
                const commandReps: string[] = []
                for (const command of commands) {
                    let argReps: string[] = []

                    for (const arg of command.args) {
                        argReps.push(
                            arg.optional ? `[${arg.name}]` : `<${arg.name}>`
                        )
                    }

                    const args: string = argReps.join(" ")
                    commandReps.push(
                        `**${command.name}** ${args ? `\`${args}\` ` : ""}${
                            command.description
                                ? `*${command.description}*`
                                : ""
                        }${command.subCommands ? " :book:" : ""}`
                    )
                }
                const commandString = commandReps.join("\n")
                categoryEmbeds.push(
                    parseEmbed("help/category", {
                        name: categoryName,
                        commands: commandString,
                    })
                )
            }

            const prefix = client.getPrefix(context.guild)
            await context.replyEmbed(
                parseEmbed("help", {
                    prefix: typeof prefix == "string" ? prefix : prefix[0],
                    categories: categoryEmbeds,
                })
            )
            return
        }
    },
})
