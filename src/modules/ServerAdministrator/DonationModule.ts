import { command, CommandCategories } from "@utils/commands";
import { monitor } from "@utils/monitor";
import inhibitors from "@utils/inhibitors";
import { commandDescriptions, errorMessage, strings } from "@utils/messages";
import { Module } from "@utils/modules";
import * as Arguments from "@utils/arguments";
import Discord from "discord.js";
import { env } from "@utils/constants";

export default class DonationModule extends Module {
  @monitor({ event: "guildMemberRoleAdd" })
  async onGuildMemberRoleAdd(oldMember: Discord.GuildMember, newMember: Discord.GuildMember, role: Discord.Role): Promise<void> {
    if (newMember.guild.id !== env.MAIN_GUILD_ID) return;
    if (![env.ROLES.HYPERION, env.ROLES.EVOCATION_MIRACULUM].includes(role.id)) return;
    const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
    const firstEntry = auditLogs.entries.first();
    if (!(firstEntry.changes[0].key === "$add" && [this.client.user.id].includes(firstEntry.executor.id))) { newMember.roles.remove(role, strings.modules.donations.auditLogDonationRoleAdd); }
  }

  @command({
    inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [Arguments.GuildMember, new Arguments.Remainder(String)], aliases: ["ld"], staff: true, usage: "<member:member|snowflake> <item:...string>", description: commandDescriptions.logdonation
  })
  logdonation(msg: Discord.Message, member: Discord.GuildMember, item: string): void {
    msg.delete();
    if (member.user.bot) {
      errorMessage(msg, strings.general.error(strings.modules.donations.commands.logdonationBotError));
      return;
    }
    if (member.roles.cache.has(env.ROLES.HYPERION)) msg.channel.send(strings.general.success(strings.modules.donations.commands.logdonationAlreadyHyperion(member.user)), { allowedMentions: { roles: [], users: [] } }).then((m) => setTimeout(() => m.delete(), 5000));
    else {
      member.roles.add(env.ROLES.HYPERION);
      msg.channel.send(strings.general.success(strings.modules.donations.commands.logdonationNewHyperion(member.user)), { allowedMentions: { roles: [], users: [] } }).then((m) => setTimeout(() => m.delete(), 5000));
    }
    (msg.guild.channels.resolve(env.CHANNELS.DONATION_LOG) as Discord.TextChannel).send(strings.modules.donations.commands.logdonationLogEntry(member.user, item, msg.author));
  }

  @command({
    inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [Arguments.GuildMember], staff: true, usage: "<member:member|snowflake>", description: commandDescriptions.miraculum
  })
  async miraculum(msg: Discord.Message, member: Discord.GuildMember): Promise<void> {
    await member.roles.add(env.ROLES.EVOCATION_MIRACULUM);
    msg.channel.send(strings.general.success(strings.modules.donations.commands.awardMiraculum(member.user)), { allowedMentions: { roles: [], users: [] } });
  }
}
