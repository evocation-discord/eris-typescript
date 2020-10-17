import { GuildMember } from "discord.js";
import { ErisClient } from "../client/ErisClient";

declare module "discord.js" {
  interface Message {
    client: ErisClient
  }

  interface ClientEvents {
    eventLog: [string, string],
    guildMemberRoleAdd: [GuildMember, GuildMember, Role],
    guildMemberRoleRemove: [GuildMember, GuildMember, Role],
    voiceChannelJoin: [GuildMember, VoiceChannel],
    voiceChannelLeave: [GuildMember, VoiceChannel],
    voiceChannelSwitch: [GuildMember, VoiceChannel, VoiceChannel],
    voiceChannelDeaf: [GuildMember, "self-deafed" | "server-deafed"]
  }
}
