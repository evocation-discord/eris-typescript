import { env } from "@utils/constants";
import strings from "@utils/messages";
import { Module } from "@utils/modules";
import { monitor } from "@utils/monitor";
import Discord from "discord.js";

export default class VoiceModule extends Module {
  @monitor({ event: "voiceChannelJoin" })
  async voiceChannelJoin(member: Discord.GuildMember, voiceChannel: Discord.VoiceChannel): Promise<void> {
    if (voiceChannel.id === env.CHANNELS.EVOCATION_VOICE || voiceChannel.parent.name === "Among Us") {
      await member.roles.add(env.ROLES.VOICE_CONNECTED, strings.modules.voice.joined(voiceChannel.name));
    }
  }

  @monitor({ event: "voiceChannelLeave" })
  async voiceChannelLeave(member: Discord.GuildMember, voiceChannel: Discord.VoiceChannel): Promise<void> {
    if (voiceChannel.id === env.CHANNELS.EVOCATION_VOICE || voiceChannel.parent.name === "Among Us") {
      await member.roles.remove(env.ROLES.VOICE_CONNECTED, strings.modules.voice.left(voiceChannel.name));
    }
  }

  @monitor({ event: "voiceChannelSwitch" })
  async voiceChannelSwitch(member: Discord.GuildMember, oldVoice: Discord.VoiceChannel, newVoice: Discord.VoiceChannel): Promise<void> {
    if (oldVoice.id === env.CHANNELS.EVOCATION_VOICE || oldVoice.parent.name === "Among Us") {
      await member.roles.remove(env.ROLES.VOICE_CONNECTED, strings.modules.voice.left(oldVoice.name));
    }
    if (newVoice.id === env.CHANNELS.EVOCATION_VOICE || newVoice.parent.name === "Among Us") {
      await member.roles.add(env.ROLES.VOICE_CONNECTED, strings.modules.voice.joined(newVoice.name));
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

  @monitor({ event: "guildMemberRoleAdd" })
  async onGuildMemberRoleAdd(oldMember: Discord.GuildMember, newMember: Discord.GuildMember, role: Discord.Role): Promise<void> {
    if (newMember.guild.id !== env.MAIN_GUILD_ID) return;
    if (role.id !== env.ROLES.VOICE_CONNECTED) return;
    const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
    const firstEntry = auditLogs.entries.first();
    if (!(firstEntry.changes[0].key === "$add" && [this.client.user.id].includes(firstEntry.executor.id))) { newMember.roles.remove(role, strings.modules.affiliate.roleRemoveNotLegitimacy); }
  }
}
