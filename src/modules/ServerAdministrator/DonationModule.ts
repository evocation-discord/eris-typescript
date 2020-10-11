import { Module, command, inhibitors, Remainder, CHANNELS, ROLES, monitor, MAIN_GUILD_ID, CommandCategories, strings, commandDescriptions, errorMessage } from "@lib/utils";
import { GuildMember, Message, TextChannel } from "discord.js";

export default class DonationModule extends Module {
  @monitor({ event: "guildMemberUpdate" })
  async onGuildMemberRoleAdd(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (newMember.guild.id !== MAIN_GUILD_ID) return;
    if (!oldMember.roles.cache.has(ROLES.HYPERION) && newMember.roles.cache.has(ROLES.HYPERION)) {
      const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
      const firstEntry = auditLogs.entries.first();
      if (!(firstEntry.changes[0].key === "$add" && ["242730576195354624", this.client.user.id].includes(firstEntry.executor.id)))
        newMember.roles.remove(ROLES.HYPERION, strings.modules.donations.auditLogDonationRoleAdd);
    }
    if (!oldMember.roles.cache.has(ROLES.EVOCATION_MIRACULUM) && newMember.roles.cache.has(ROLES.EVOCATION_MIRACULUM)) {
      const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
      const firstEntry = auditLogs.entries.first();
      if (!(firstEntry.changes[0].key === "$add" && ["242730576195354624", this.client.user.id].includes(firstEntry.executor.id)))
        newMember.roles.remove(ROLES.EVOCATION_MIRACULUM, strings.modules.donations.auditLogDonationRoleAdd);
    }
  }

  @command({ inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [GuildMember, new Remainder(String)], aliases: ["ld"], staff: true, usage: "<member:member|snowflake> <item:...string>", description: commandDescriptions.logdonation })
  logdonation(msg: Message, member: GuildMember, item: string): void {
    msg.delete();
    if (member.user.bot) {
      errorMessage(msg, strings.general.error(strings.modules.donations.commands.logdonationBotError));
      return;
    }
    if (member.roles.cache.has(ROLES.HYPERION))
      msg.channel.send(strings.general.success(strings.modules.donations.commands.logdonationAlreadyHyperion(member.user)), { allowedMentions: { roles: [], users: [] } }).then(msg => setTimeout(() => msg.delete(), 5000));
    else {
      member.roles.add(ROLES.HYPERION);
      msg.channel.send(strings.general.success(strings.modules.donations.commands.logdonationNewHyperion(member.user)), { allowedMentions: { roles: [], users: [] } }).then(msg => setTimeout(() => msg.delete(), 5000));
    }
    (msg.guild.channels.resolve(CHANNELS.DONATION_LOG) as TextChannel).send(strings.modules.donations.commands.logdonationLogEntry(member.user, item, msg.author));
  }

  @command({ inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [GuildMember], staff: true, usage: "<member:member|snowflake>", description: commandDescriptions.miraculum })
  async miraculum(msg: Message, member: GuildMember): Promise<void> {
    await member.roles.add(ROLES.EVOCATION_MIRACULUM);
    msg.channel.send(strings.general.success(strings.modules.donations.commands.awardMiraculum(member.user)), { allowedMentions: { roles: [], users: [] } });
  }
}
