import { env } from "@utils/constants";
import { strings } from "@utils/messages";
import { Module } from "@utils/modules";
import { monitor } from "@utils/monitor";
import Discord from "discord.js";

export default class VoiceModule extends Module {
  @monitor({ event: "voiceChannelJoin" })
  async voiceChannelJoin(member: Discord.GuildMember, voiceChannel: Discord.VoiceChannel): Promise<void> {
    if (voiceChannel.id === env.CHANNELS.EVOCATION_VOICE) {
      await member.roles.add(env.ROLES.VOICE_CONNECTED, strings.modules.voice.joined);
    }
  }

  @monitor({ event: "voiceChannelLeave" })
  async voiceChannelLeave(member: Discord.GuildMember, voiceChannel: Discord.VoiceChannel): Promise<void> {
    if (voiceChannel.id === env.CHANNELS.EVOCATION_VOICE) {
      await member.roles.remove(env.ROLES.VOICE_CONNECTED, strings.modules.voice.left);
    }
  }

  @monitor({ event: "voiceChannelSwitch" })
  async voiceChannelSwitch(member: Discord.GuildMember, oldVoice: Discord.VoiceChannel, newVoice: Discord.VoiceChannel): Promise<void> {
    if (oldVoice.id === env.CHANNELS.EVOCATION_VOICE) {
      await member.roles.remove(env.ROLES.VOICE_CONNECTED, strings.modules.voice.left);
    }
    if (newVoice.id === env.CHANNELS.EVOCATION_VOICE) {
      await member.roles.add(env.ROLES.VOICE_CONNECTED, strings.modules.voice.joined);
    }
  }

  @monitor({ event: "voiceChannelDeaf" })
  async voiceChannelDeaf(member: Discord.GuildMember, deafType: "self-deafed" | "server-deafed"): Promise<void> {
    if (member.voice.channel.id === env.CHANNELS.EVOCATION_VOICE && deafType === "self-deafed") {
      const oldChannel = member.voice.channel;
      await member.voice.setChannel(member.guild.afkChannel);
      member.user.send(strings.modules.voice.deafMessage(oldChannel.name, member.guild.afkChannel.name));
    }
  }
}
