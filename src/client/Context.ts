import { ContextMenuInteraction, Guild, GuildMember, Message, MessageEmbed, User } from "discord.js";
import { parseEmbed } from "../utils/parseEmbed";

abstract class AContext{
    message: Message

    constructor(message: Message){
        this.message = message
    }
    async reply(data: string){
        await this.message.reply(data)
    }

    async replyEmbed(embed: object){
        await this.message.reply({
            embeds: [embed]
        })
    }

    async error(title: string, description?: string){
        await this.replyEmbed(parseEmbed("error", {
            title: title,
            description: description || ""
        }))
    }

    async success(title: string, description?: string){
        await this.replyEmbed(parseEmbed("success", {
            title: title,
            description: description || ""
        }))
    }

    

}

export class GuildContext extends AContext{

    get guild(): Guild{
        return this.message.guild!
    }

    get sender(): GuildMember{
        return this.message.member!
    }
}

export class DMContext extends AContext{

    get sender(): User{
        return this.message.author
    }
}

export type Context = GuildContext | DMContext