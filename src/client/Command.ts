import { Message, User, Channel } from "discord.js"
import Client from "./Client"
import { Context } from "./Context"

export type ArgTypes = string | number | User | Channel | undefined
export type ArgTypeRepresentations = "string" | "number" | "user" | "channel" | "string..."

type Optional<T> = T | null

interface Argument {
    type: ArgTypeRepresentations,
    name: string,
    description?: string,
    optional?: boolean
}

export type Args = Argument[]

interface CommandOptions {
    name?: string
    aliases?: string[]
    description?: string
    category?: string

    subCommands?: Command[]

    args: Args
    execute: (context: Context, args: {[propName: string]: ArgTypes}, self: Command, client: Client) => Promise<void>
}

export class Command {

    name?: string
    aliases?: string[]
    description: Optional<string>
    category: Optional<string>

    subCommands?: Command[]

    args: Args
    execute: (context: Context, args: {[propName: string]: ArgTypes}, self: Command, client: Client) => Promise<void>

    constructor(options: CommandOptions) {
        this.name = options.name
        this.aliases = options.aliases
        this.description = options.description ? options.description : null
        this.category = options.category ? options.category : null
        this.subCommands = options.subCommands
        this.args = options.args
        this.execute = options.execute
    }

    subCommand(name: string): Command | undefined {
        return this.subCommands?.filter((value) => value.name === name)[0]
    }

}