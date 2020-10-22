import { monitor } from "@utils/monitor";
import inhibitors from "@utils/inhibitors";
import strings, { commandDescriptions } from "@utils/messages";
import { command, CommandCategories } from "@utils/commands";
import Discord from "discord.js";
import { Module } from "@utils/modules";
import * as Arguments from "@utils/arguments";
import { env } from "@utils/constants";
import Embed from "@utils/embed";

export default class AffiliateModule extends Module {
  @monitor({ event: "guildMemberRoleAdd" })
  async onGuildMemberRoleAdd(oldMember: Discord.GuildMember, newMember: Discord.GuildMember, role: Discord.Role): Promise<Discord.GuildMember|void> {
    if (newMember.guild.id !== env.MAIN_GUILD_ID) return;
    if (role.id !== env.ROLES.AFFILIATE) return;
    const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
    const firstEntry = auditLogs.entries.first();
    if (!(firstEntry.changes[0].key === "$add" && [this.client.user.id].includes(firstEntry.executor.id))) { return newMember.roles.remove(env.ROLES.AFFILIATE, strings.modules.affiliate.roleRemoveNotLegitimacy); }
    (newMember.client.channels.resolve(env.CHANNELS.AFFILIATE_LOUNGE) as Discord.TextChannel).send(strings.modules.affiliate.welcomeMessage(newMember.user));
  }

  @monitor({ event: "guildMemberRoleRemove" })
  async onGuildMemberRoleRemove(oldMember: Discord.GuildMember, newMember: Discord.GuildMember, role: Discord.Role): Promise<void> {
    if (newMember.guild.id !== env.MAIN_GUILD_ID) return;
    if (role.id !== env.ROLES.AFFILIATE) return;
    const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
    const firstEntry = auditLogs.entries.first();
    if (!(firstEntry.changes[0].key === "$remove" && [this.client.user.id].includes(firstEntry.executor.id))) { newMember.roles.add(env.ROLES.AFFILIATE, strings.modules.affiliate.roleAddNotLegitimacy); }
  }

  @command({
    inhibitors: [inhibitors.serverGrowthLeadOnly, inhibitors.canOnlyBeExecutedInChannels(["server-growth-exploration"], true)], usage: "<member:member>", args: [Arguments.GuildMember], description: commandDescriptions.affiliate, staff: true, group: CommandCategories["Affiliation Management"]
  })
  async affiliate(message: Discord.Message, member: Discord.GuildMember): Promise<void> {
    if (message.guild.id !== env.MAIN_GUILD_ID) return;
    if (member === message.member) return strings.errors.errorMessage(message, strings.errors.error(strings.modules.affiliate.cantAffiliateYourself));
    if (member.user.bot) return strings.errors.errorMessage(message, strings.errors.error(strings.modules.affiliate.cantAffiliateBots));
    if (member.roles.cache.has(env.ROLES.AFFILIATE)) return strings.errors.errorMessage(message, strings.errors.error(strings.modules.affiliate.affiliate.denied));
    await member.roles.add(env.ROLES.AFFILIATE, strings.modules.affiliate.affiliate.audit(message.author));
    message.channel.send(strings.general.success(strings.modules.affiliate.affiliate.success(member.user)), { allowedMentions: { roles: [], users: [] } });
  }

  @command({
    inhibitors: [inhibitors.serverGrowthLeadOnly, inhibitors.canOnlyBeExecutedInChannels(["server-growth-exploration"], true)], usage: "<member:member>", args: [Arguments.GuildMember], description: commandDescriptions.removeaffiliate, aliases: ["ra"], staff: true, group: CommandCategories["Affiliation Management"]
  })
  async removeaffiliate(message: Discord.Message, member: Discord.GuildMember): Promise<void> {
    if (message.guild.id !== env.MAIN_GUILD_ID) return;
    if (member === message.member) return strings.errors.errorMessage(message, strings.errors.error(strings.modules.affiliate.cantAffiliateYourself));
    if (member.user.bot) return strings.errors.errorMessage(message, strings.errors.error(strings.modules.affiliate.cantAffiliateBots));
    if (!member.roles.cache.has(env.ROLES.AFFILIATE)) return strings.errors.errorMessage(message, strings.errors.error(strings.modules.affiliate.removeaffiliate.denied));
    await member.roles.remove(env.ROLES.AFFILIATE, strings.modules.affiliate.removeaffiliate.audit(message.author));
    message.channel.send(strings.general.success(strings.modules.affiliate.removeaffiliate.success(member.user)), { allowedMentions: { roles: [], users: [] } });
  }

  @command({
    inhibitors: [inhibitors.serverGrowthLeadOnly, inhibitors.canOnlyBeExecutedInChannels(["server-growth-exploration"], true)], description: commandDescriptions.listaffiliate, staff: true, group: CommandCategories["Affiliation Management"]
  })
  async listaffiliates(message: Discord.Message): Promise<Discord.Message> {
    const members = message.client.guilds.resolve(env.MAIN_GUILD_ID).roles.resolve(env.ROLES.AFFILIATE).members.array();
    const embed = new Embed()
      .addField(strings.modules.affiliate.listaffiliates.embedFieldTitle, members.map((u) => strings.modules.affiliate.listaffiliates.affiliateMap(u)).join("\n") || strings.modules.affiliate.listaffiliates.noAffiliate);
    return message.channel.send(embed);
  }
}
