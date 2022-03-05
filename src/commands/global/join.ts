import { Command } from "../../client/Command"
import { joinVoiceChannel } from "@discordjs/voice"

export const command = new Command({
    aliases: [
        "j"
    ],
    description: "Joins the voice channel you're in",
    category: ":tools: Miscellaneous",
    
    args: [],
    execute: async (message, args, self, client) => {
        /*const voiceChannel = message.member?.voice.channelId
        if (voiceChannel == null) {
            await message.reply(
                "You need to be in a voice channel to play music!"
            )
            return
        }
        const connection = joinVoiceChannel({
            guildId: message.guildId!,
            channelId: voiceChannel,
            //@ts-ignore
            adapterCreator: message.guild!.voiceAdapterCreator
        })
        if (client.getGuildMemory(message.guild!).player == null) {
            client.getGuildMemory(message.guild!).player = createAudioPlayer()
            client.getGuildMemory(message.guild!).player?.on(AudioPlayerStatus.Idle, async () => {
                const justPlayed = client.getGuildMemory(message.guild!).queue.shift()
                if (client.getGuildMemory(message.guild!).loop && justPlayed != null) client.getGuildMemory(message.guild!).queue.push(justPlayed)
                if (client.getGuildMemory(message.guild!).queue.length != 0) {
                    await play(client, message.guild!)
                }
            })
        }
        const player = client.getGuildMemory(message.guild!).player!
        client.getGuildMemory(message.guild!).subscription = connection.subscribe(player)*/
        const voiceChannel = message.member?.voice.channelId
        if (voiceChannel == null) {
            await message.reply(
                "You need to be in a voice channel to play music!"
            )
            return
        }

        const guild = message.guild
        if (guild == null) {
            await message.reply(
                "You must be in a guild to use this bot!"
            )
            return
        }

        const guildMemory = client.getGuildMemory(guild)

        guildMemory.connection = joinVoiceChannel({
            guildId: guild.id,
            channelId: voiceChannel,
            //@ts-ignore
            adapterCreator: guild.voiceAdapterCreator
        })
    }
})