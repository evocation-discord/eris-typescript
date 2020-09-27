import { CHANNELS, command, CommandCategories, commandDescriptions, Embed, inhibitors, MAIN_GUILD_ID, messageLinkRegex, Module, monitor, ROLES, strings } from "@lib/utils";
import { Message, GuildMember, Role,TextChannel } from "discord.js";

export default class AffiliateModule extends Module {

  @monitor({ event: "guildMemberRoleAdd" })
  async onGuildMemberRoleAdd(oldMember: GuildMember, newMember: GuildMember, role: Role): Promise<GuildMember|void> {
    if (newMember.guild.id !== MAIN_GUILD_ID) return;
    if (role.id !== ROLES.AFFILIATE) return;
    const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
    const firstEntry = auditLogs.entries.first();
    if (!(firstEntry.changes[0].key === "$add" && ["242730576195354624", this.client.user.id].includes(firstEntry.executor.id)))
      return newMember.roles.remove(ROLES.AFFILIATE, strings.modules.affiliate.roleRemoveNotLegitimacy);
    (newMember.client.channels.resolve(CHANNELS.AFFILIATE_LOUNGE) as TextChannel).send(strings.modules.affiliate.welcomeMessage(newMember.user));
  }

  @monitor({ event: "guildMemberRoleRemove" })
  async onGuildMemberRoleRemove(oldMember: GuildMember, newMember: GuildMember, role: Role): Promise<void> {
    if (newMember.guild.id !== MAIN_GUILD_ID) return;
    if (role.id !== ROLES.AFFILIATE) return;
    const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
    const firstEntry = auditLogs.entries.first();
    if (!(firstEntry.changes[0].key === "$remove" && ["242730576195354624", this.client.user.id].includes(firstEntry.executor.id)))
      newMember.roles.add(ROLES.AFFILIATE, strings.modules.affiliate.roleAddNotLegitimacy);
  }

  @command({ inhibitors: [inhibitors.serverGrowthLeadOnly, inhibitors.canOnlyBeExecutedInChannels(["server-growth-exploration"], true)], usage: "<member:member>", args: [GuildMember], description: commandDescriptions.affiliate, staff: true, group: CommandCategories["Affiliation Management"] })
  async affiliate(message: Message, member: GuildMember): Promise<Message> {
    if (message.guild.id !== MAIN_GUILD_ID) return;
    if (member === message.member) return message.channel.send(strings.general.error(strings.modules.affiliate.cantAffiliateYourself));
    if (member.user.bot) return message.channel.send(strings.general.error(strings.modules.affiliate.cantAffiliateBots));
    if (member.roles.cache.has(ROLES.AFFILIATE)) return message.channel.send(strings.modules.affiliate.affiliate.denied);
    await member.roles.add(ROLES.AFFILIATE, strings.modules.affiliate.affiliate.audit(message.author));
    return message.channel.send(strings.general.success(strings.modules.affiliate.affiliate.success(member.user)), { allowedMentions: { roles: [], users: [] } });
  }

  @command({ inhibitors: [inhibitors.serverGrowthLeadOnly, inhibitors.canOnlyBeExecutedInChannels(["server-growth-exploration"], true)], usage: "<member:member>", args: [GuildMember], description: commandDescriptions.removeaffiliate, aliases: ["ra"], staff: true, group: CommandCategories["Affiliation Management"] })
  async removeaffiliate(message: Message, member: GuildMember): Promise<Message> {
    if (message.guild.id !== MAIN_GUILD_ID) return;
    if (member === message.member) return message.channel.send(strings.general.error(strings.modules.affiliate.cantAffiliateYourself));
    if (member.user.bot) return message.channel.send(strings.general.error(strings.modules.affiliate.cantAffiliateBots));
    if (!member.roles.cache.has(ROLES.AFFILIATE)) return message.channel.send(strings.modules.affiliate.affiliate.denied);
    await member.roles.remove(ROLES.AFFILIATE, strings.modules.affiliate.removeaffiliate.audit(message.author));
    return message.channel.send(strings.general.success(strings.modules.affiliate.removeaffiliate.success(member.user)), { allowedMentions: { roles: [], users: [] } });
  }

  @command({ inhibitors: [inhibitors.serverGrowthLeadOnly, inhibitors.canOnlyBeExecutedInChannels(["server-growth-exploration"], true)], description: commandDescriptions.listaffiliate, staff: true, group: CommandCategories["Affiliation Management"] })
  async listaffiliates(message: Message): Promise<Message> {
    const members = message.client.guilds.resolve(MAIN_GUILD_ID).roles.resolve(ROLES.AFFILIATE).members.array();
    const embed = new Embed()
      .addField(strings.modules.affiliate.listaffiliates.embedFieldTitle, members.map(u => strings.modules.affiliate.listaffiliates.affiliateMap(u)).join("\n") || strings.modules.affiliate.listaffiliates.noAffiliate);
    return message.channel.send(embed);
  }
}