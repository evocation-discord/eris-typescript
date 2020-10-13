import { command, CommandCategories } from "@utils/commands";
import { monitor } from "@utils/monitor";
import inhibitors from "@utils/inhibitors";
import { commandDescriptions, errorMessage, strings } from "@utils/messages";
import { Module } from "@utils/modules";
import * as Arguments from "@utils/arguments";
import Discord from "discord.js";
import { env } from "@utils/constants";

export default class DonationModule extends Module {
  @monitor({ event: "guildMemberUpdate" })
  async onGuildMemberRoleAdd(oldMember: Discord.GuildMember, newMember: Discord.GuildMember): Promise<void> {
    if (newMember.guild.id !== env.MAIN_GUILD_ID) return;
    if (!oldMember.roles.cache.has(env.ROLES.HYPERION) && newMember.roles.cache.has(env.ROLES.HYPERION)) {
      const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
      const firstEntry = auditLogs.entries.first();
      if (!(firstEntry.changes[0].key === "$add" && ["242730576195354624", this.client.user.id].includes(firstEntry.executor.id)))
        newMember.roles.remove(env.ROLES.HYPERION, strings.modules.donations.auditLogDonationRoleAdd);
    }
    if (!oldMember.roles.cache.has(env.ROLES.EVOCATION_MIRACULUM) && newMember.roles.cache.has(env.ROLES.EVOCATION_MIRACULUM)) {
      const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
      const firstEntry = auditLogs.entries.first();
      if (!(firstEntry.changes[0].key === "$add" && ["242730576195354624", this.client.user.id].includes(firstEntry.executor.id)))
        newMember.roles.remove(env.ROLES.EVOCATION_MIRACULUM, strings.modules.donations.auditLogDonationRoleAdd);
    }
  }

  @command({ inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [Arguments.GuildMember, new Arguments.Remainder(String)], aliases: ["ld"], staff: true, usage: "<member:member|snowflake> <item:...string>", description: commandDescriptions.logdonation })
  logdonation(msg: Discord.Message, member: Discord.GuildMember, item: string): void {
    msg.delete();
    if (member.user.bot) {
      errorMessage(msg, strings.general.error(strings.modules.donations.commands.logdonationBotError));
      return;
    }
    if (member.roles.cache.has(env.ROLES.HYPERION))
      msg.channel.send(strings.general.success(strings.modules.donations.commands.logdonationAlreadyHyperion(member.user)), { allowedMentions: { roles: [], users: [] } }).then(msg => setTimeout(() => msg.delete(), 5000));
    else {
      member.roles.add(env.ROLES.HYPERION);
      msg.channel.send(strings.general.success(strings.modules.donations.commands.logdonationNewHyperion(member.user)), { allowedMentions: { roles: [], users: [] } }).then(msg => setTimeout(() => msg.delete(), 5000));
    }
    (msg.guild.channels.resolve(env.CHANNELS.DONATION_LOG) as Discord.TextChannel).send(strings.modules.donations.commands.logdonationLogEntry(member.user, item, msg.author));
  }

  @command({ inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [Arguments.GuildMember], staff: true, usage: "<member:member|snowflake>", description: commandDescriptions.miraculum })
  async miraculum(msg: Discord.Message, member: Discord.GuildMember): Promise<void> {
    await member.roles.add(env.ROLES.EVOCATION_MIRACULUM);
    msg.channel.send(strings.general.success(strings.modules.donations.commands.awardMiraculum(member.user)), { allowedMentions: { roles: [], users: [] } });
  }
}
