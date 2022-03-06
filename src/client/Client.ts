import discord, { Intents, Guild, Message } from "discord.js"
import { Config, Settings } from "../data/Config"
import { Memory, LocalMemory } from "../data/Memory"
import glob from "glob"
import { writeFileSync } from "fs"
import { Command, ArgTypes } from "./Command"

class BreakError {
    type: "NaN" | "NaU" | "NaC"

    constructor(type: "NaN" | "NaU" | "NaC") {
        this.type = type
    }
}

interface ClientOptions {
    commandsDir: string,
    configFile: string,
    testServer?: Array<string> | string
}

/*
    |--------|
    | Client |
    |--------|
*/

export default class Client {

    /*
        |--------|
        | Fields |
        |--------|
    */

    client: discord.Client
    config: Config
    configFile: string
    commandsDir: string
    testServer: Array<string> | string | null
    globalCommands: Map<string, Command> = new Map()
    globalAliases: Map<string, string> = new Map()
    testCommands: Map<string, Command> = new Map()
    memory: Memory = { guilds: {} }

    /*
        |---------------|
        | Miscellaneous |
        |---------------|
    */

    constructor(options: ClientOptions) {
        this.commandsDir = options.commandsDir
        this.testServer = options.testServer || null
        this.configFile = options.configFile
        this.config = require(options.configFile)

        this.client = new discord.Client({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_VOICE_STATES
            ]
        })
        
        this.client.on("ready", this.onReady.bind(this))
        this.client.on("messageCreate", this.onMessageCreate.bind(this))
        this.client.on("shardDisconnect", this.onShardDisconnect.bind(this))

    }

    async login(token: string) {
        this.client.login(token)
    }

    getPrefix(guild: Guild | null): string | string[] {
        return this.getSettings(guild).prefix
    }

    getSettings(guild: Guild | null): Settings {
        if (guild && this.config.guilds[guild.id]) {
            return this.config.guilds[guild.id].settings
        } else {
            return this.config.settings
        }
    }

    getGuildSettings(guild: Guild | null): Settings {
        if (!guild) {
            throw Error("guild is null")
        }
        if (!this.config.guilds[guild.id]) {
            this.config.guilds[guild.id] = {settings: this.config.settings, playlists: {}}
        }
        return this.config.guilds[guild.id].settings
    }

    getGuildMemory(guild: Guild): LocalMemory {
        if (!this.memory.guilds[guild.id]) {
            this.memory.guilds[guild.id] = {connection: undefined, player: undefined}
        }
        return this.memory.guilds[guild.id]
    }

    fillCommand(command: Command, file: string): Command {
        if (!command.name) {
            let fileName = file.split('\\').pop()?.split('/').pop()?.split(".")[0];
            if (fileName) {
                command.name = fileName
            }
            else {
                console.log("Could not find the name!")
                command.name = "missingname"
            }
        }

        return command
    }

    addTestCommands(files: string[]) {
        console.log("Adding test commands...")
        for (let index in files) {
            let file = files[index]
            let command = this.fillCommand(require(file).command, file)
            this.testCommands.set(command.name!, command)
            console.log(`Added ${command.name}`)
        }
        console.log(`Successfully added ${files.length} test commands!`)
    }

    addGlobalCommands(files: string[]) {
        console.log("Adding global commands...")
        for (let index in files) {
            let file = files[index]
            let command = this.fillCommand(require(file).command, file)
            this.globalCommands.set(command.name!, command)
            if (command.aliases) {
                for (const alias of command.aliases) {
                    this.globalAliases.set(alias, command.name!)
                }
            }
            console.log(`Added ${command.name}`)
        }
        console.log(`Successfully added ${files.length} global commands!`)
    }

    async executeCommand(commandName: string, command: Command, message: Message, args: string[]) {
        console.log(`Found command '${commandName}'`)

        if (command.args.length === 0 || command.args[command.args.length-1].type !== "string...") {
            const possibleLenghts: number[] = []
            const optionalArgs = command.args.filter((arg) => arg.optional === true)
            for (let i = 0; i <= optionalArgs.length; i++) {
                possibleLenghts.push(command.args.length - optionalArgs.length + i)
            }

            //TODO: make it better

            if (!(possibleLenghts.includes(args.length))) {
                await message.reply(`Invalid number of arguments. Expected ${optionalArgs.length === 0 ? command.args.length : `${command.args.length-optionalArgs.length}-${command.args.length}`}, got ${args.length}`)
                return
            }
        }
        console.log(`executeCommand: ${args}`)
        let newArgs: {[propName: string]: ArgTypes} = {}
        try {
            let index = 0
            let exit = false
            for (let arg of args) {
                let cmdArg = command.args[index]
                switch (cmdArg.type) {
                    case "string": {
                        newArgs[cmdArg.name] = arg
                        break
                    }
                    case "string...": {
                        // TODO: Break out of this loop
                        newArgs[cmdArg.name] = args.slice(index).join(" ")
                        exit = true
                        break
                    }
                    case "number": {
                        let result = Number.parseInt(arg)
                        if (isNaN(result)) {
                            throw new BreakError("NaN")
                        }
                        newArgs[cmdArg.name] = result
                        break
                    }
                    case "user": {

                        break
                    }
                    case "channel": {

                        break
                    }
                }
                if (exit) break
                index++
            }
        } catch (e) {
            if (!(e instanceof BreakError)) throw e
            switch (e.type) {
                case "NaN": {
                    message.reply("Argument is not a number!")
                    return
                }
            }
        }

        await command.execute(message, newArgs, command, this)
        console.log(`Executed command '${commandName}'\n`)
    }

    async runCommand(message: Message, commandName: string, args: string[], storage: Map<string, Command> = this.testCommands, useTwoStorages: boolean = true, storage2: Map<string, Command> = this.globalCommands, noCommandCallback?: (commandName: string) => Promise<void>) {
        let command: Command | undefined

        //TODO: Overhaul alias system

        if (storage == this.testCommands) {
            if (this.testServer != null && message.guildId != null && (this.testServer.includes(message.guildId) || message.guildId === this.testServer)) {
                let value = storage.get(commandName)
                if (value != null) {
                    command = value
                }
            }
        }
        else {
            let value = storage.get(commandName)
            if (value != null) {
                command = value
            }
        }
        if (useTwoStorages && !command) {
            let value = storage2.get(commandName)
            const aliasTarget = this.globalAliases.get(commandName)
            if (value != null) {
                command = value
            }
            else if (aliasTarget) {
                value = storage2.get(aliasTarget)
                if (value != null) {
                    command = value
                }
            }
        }
        if (!command) {
            if (noCommandCallback == null) {
                await message.reply(`Could not find command '${commandName}'`)
                console.log(`Could not find command '${commandName}'`)
            } else {
                console.log(`Could not find command '${commandName}', invoking callback function`)
                await noCommandCallback(commandName)
            }
        }
        else {
            if (command.subCommands != null) {
                console.log(`Found super-command '${commandName}'`)
                let map: Map<string, Command> = new Map()
                command.subCommands.forEach((subCommand) => {
                    if (!subCommand.name) {
                        console.log("Every sub-command needs to have a name!")
                        message.reply("Error")
                    } else {
                        map.set(subCommand.name, subCommand)
                    }
                })
                await this.runCommand(message, args[0], args.slice(1), map, false, undefined, async () => {
                    await this.executeCommand(commandName, command!, message, args)
                })
            } else {
                await this.executeCommand(commandName, command, message, args)
            }
        }
    }

    hasPrefix(text: string, prefix: string | string[]): number | null {
        if (typeof prefix === "string") {
            return text.startsWith(prefix) ? prefix.length : null
        }
        let startsWith: boolean = false
        let length: number = 0
        prefix.forEach((prfx) => {
            if (!startsWith) {
                startsWith = text.startsWith(prfx)
                if (startsWith) {
                    length = prfx.length
                }
            }
        })
        return startsWith ? length : null
    }

    /*
        |----------|
        | Handlers |
        |----------|
    */

    async onReady() {
        console.log("Logged in to Discord")

        let testCommands = glob.sync(`${this.commandsDir}/test/**/*.ts`)
        testCommands.length === 0 ? console.log("No test commands found") : this.addTestCommands(testCommands)

        let globalCommands = glob.sync(`${this.commandsDir}/global/**/*.ts`)
        globalCommands.length === 0 ? console.log("No global commands found") : this.addGlobalCommands(globalCommands)

        console.log("Bot is initialized\n")
    }

    async onMessageCreate(message: Message) {
        let length = this.hasPrefix(message.content, this.getPrefix(message.guild))
        if (length != null) {
            let str = message.content.substr(length).replace(/\s+/g,' ').trim();
            let pieces = str.split(" ")
            let commandName = pieces[0].toLowerCase()
            let args = pieces.slice(1)
            console.log(`Received command '${commandName}'`)

            try {
                await this.runCommand(message, commandName, args)
            }
            catch (error) {
                if (error instanceof Error) {
                    await message.reply(`Oops... something went wrong executing this command!\nError:\n${error.name} - ${error.message}\nStack trace:\n${error.stack}`)
                }
                else {
                    await message.reply(`Oops... something went wrong executing this command!\nError:\n${error}`)
                }
            }
        }
    }

    async onShardDisconnect() {
        console.log("Shutting down...")
        console.log("Saving config...")
        writeFileSync(this.configFile, JSON.stringify(this.config))
        console.log("Shut down successful")
    }

}