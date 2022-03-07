import { exec } from "child_process"
import { Command } from "../../client/Command";

export const command = new Command({
    description: "Executes a shell command on the target maschine",
    category: ":tools: Miscellaneous",
    
    args: [
        {
            name: "command",
            type: "string..."
        }
    ],
    execute: async (message, args) => {
        const command = args.command as string

        exec(command, (error, stdout, stderr) => {
            if (error)
                message.reply(`Error:\n${error}`)
            if (stderr)
                message.reply(`Error:\n${stderr}`)
            for (let i = 0; i < stdout.length; i += 2000) {
                message.reply(stdout.slice(i, i + 2000))
            }
        })
    }
})