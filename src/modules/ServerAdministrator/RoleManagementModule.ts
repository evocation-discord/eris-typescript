/* eslint-disable no-continue */
import { DethronedUser } from "@database/models";
import * as Arguments from "@utils/arguments";
import { command, CommandCategories } from "@utils/commands";
import { env } from "@utils/constants";
import { inhibitors } from "@utils/inhibitors/Inhibitor";
import strings, { commandDescriptions } from "@utils/messages";
import { Module } from "@utils/modules";
import { guildMember as guildMemberParser } from "@utils/parsers";
import Discord from "discord.js";

export default class RoleManagementModule extends Module {
  @command({
    inhibitors: [inhibitors.botMaintainersOnly], group: CommandCategories["Bot Maintainers"], args: [new Arguments.Remainder(String)], admin: true, usage: "<members:...guildmember|snowflake>", description: commandDescriptions.dethrone
  })
  async dethrone(msg: Discord.Message, _members: string): Promise<void> {
    await msg.delete();
    const members: Discord.GuildMember[] = [];
    const logObject: { member: Discord.GuildMember, roles: Discord.Role[]}[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    for await (const member of members) {
      const roles = member.roles.cache.filter((r) => !r.managed && msg.guild.me.roles.highest.position > r.position && r.id !== msg.guild.roles.everyone.id).array();
      if (roles.length === 0) continue;
      await DethronedUser.create({
        id: member.user.id,
        roles: roles.map((r) => r.id)
      }).save();
      logObject.push({ member, roles });
      await member.roles.remove(roles, strings.modules.administrator.rolemanagement.dethrone.auditLogReason(msg.author));
    }
    await msg.channel.send([strings.modules.administrator.rolemanagement.dethrone.success, strings.general.codeblockMember([], logObject.map((o) => o.member))].join("\n"), { split: true });
    const channel = await msg.client.channels.fetch(env.CHANNELS.ERIS_LOG) as Discord.TextChannel;
    await channel.send(strings.modules.administrator.rolemanagement.dethrone.log(msg.author, logObject), { allowedMentions: { roles: [], users: [] } });
  }

  @command({
    inhibitors: [inhibitors.botMaintainersOnly], group: CommandCategories["Bot Maintainers"], args: [new Arguments.Remainder(String)], admin: true, usage: "<members:...guildmember|snowflake>", description: commandDescriptions.crown
  })
  async crown(msg: Discord.Message, _members: string): Promise<void> {
    await msg.delete();
    const members: Discord.GuildMember[] = [];
    const logObject: { member: Discord.GuildMember, roles: Discord.Role[]}[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    for await (const member of members) {
      const user = await DethronedUser.findOne({ where: { id: member.user.id } });
      if (!user) continue;
      logObject.push({ member, roles: user.roles.map((r) => msg.guild.roles.resolve(r)) });
      await member.roles.add(user.roles.map((r) => msg.guild.roles.resolve(r)), strings.modules.administrator.rolemanagement.crown.auditLogReason(msg.author));
      await user.remove();
    }
    await msg.channel.send([strings.modules.administrator.rolemanagement.crown.success, strings.general.codeblockMember(logObject.map((o) => o.member), [])].join("\n"), { split: true });
    const channel = await msg.client.channels.fetch(env.CHANNELS.ERIS_LOG) as Discord.TextChannel;
    await channel.send(strings.modules.administrator.rolemanagement.crown.log(msg.author, logObject), { allowedMentions: { roles: [], users: [] } });
  }
}
