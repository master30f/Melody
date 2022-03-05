import { CommandInteractionOptionResolver } from "discord.js";
import { Command } from "../../client/Command";
import { parseEmbed } from "../../utils/parseEmbed";

export const command = new Command({
    description: "Shows this message",
    category: ":tools: Miscellaneous",
    
    args: [
        {
            name: "command",
            type: "string",
            description: "lololol",
            optional: true
        }
    ],
    execute: async (message, args, self, client) => {
        const cmd = args.command as string | undefined

        if (cmd != null) {
            let command = client.globalCommands.get(cmd)

            if (command != null) {
                let subcommandEmbeds = []
                for(let subcommand of command.subCommands ? command.subCommands: []){
                    subcommandEmbeds.push(parseEmbed("help/subcommand",{
                        name: subcommand.name!, 
                        description: subcommand.description!,
                        aliases: subcommand.aliases? subcommand.aliases!.join(", "):" ",

                    }))
                }  
                await message.reply({
                    embeds: [parseEmbed("help/command", {
                        name: command.name!, 
                        description: command.description!,
                        aliases: command.aliases? command.aliases!.join(", "):" ",
                        subcommands: subcommandEmbeds
                    })]
                })
            }
            else {
                await message.reply(`Could not find command ${cmd}`)
            }
        }
        else {
            const categories: Map<string, Command[]> = new Map()
            for (const commandName of client.globalCommands.keys()) {
                const command = client.globalCommands.get(commandName)!
                const category = command.category || "Other"
                if (categories.has(category)) {
                    categories.get(category)?.push(command)
                }
                else {
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
                        argReps.push(arg.optional ? `[${arg.name}]` : `<${arg.name}>`)
                    }
                    
                    const args: string = argReps.join(" ")
                    commandReps.push(`**${command.name}** ${args ? `\`${args}\` ` : ""}${command.description ? `*${command.description}*` : ""}${command.subCommands ? " :book:" : ""}`)
                }
                const commandString = commandReps.join("\n")
                categoryEmbeds.push(parseEmbed("help/category", {
                    name: categoryName,
                    commands: commandString
                }))
            }
            
            const prefix = client.getPrefix(message.guild)
            await message.reply({
                embeds: [
                    parseEmbed("help", {
                        prefix: typeof prefix == "string" ? prefix : prefix[0],
                        categories: categoryEmbeds
                    })
                ]
            })
            return
        }
    }
})