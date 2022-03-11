import { Command } from "../../client/Command"
import { joinVoiceChannel } from "@discordjs/voice"
import { DMContext } from "../../client/Context"

export const command = new Command({
    aliases: [
        "j"
    ],
    description: "Joins the voice channel you're in",
    category: ":tools: Miscellaneous",
    
    args: [],
    execute: async (context, args, self, client) => {
        if (context instanceof DMContext) {
            context.error("You must be in a guild to use this command")
            return
        }

        const voiceChannel = context.sender.voice.channelId
        if (voiceChannel == null) {
            await context.reply(
                "You need to be in a voice channel to play music!"
            )
            return
        }

        const guildMemory = client.getGuildMemory(context.guild)

        guildMemory.connection = joinVoiceChannel({
            guildId: context.guild.id,
            channelId: voiceChannel,
            //@ts-ignore
            adapterCreator: context.guild.voiceAdapterCreator
        })
    }
})