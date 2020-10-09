import { CHANNELS, codeblockMember, command, CommandCategories, commandDescriptions, Embed, errorMessage, guildMemberParser, inhibitors, messageLinkRegex, Module, PV, Remainder, ROLES, strings } from "@lib/utils";
import { DethronedUser } from "@lib/utils/database/models/DethronedUser";
import { Message, GuildMember, TextChannel, Role } from "discord.js";

export default class RoleManagementModule extends Module {
  @command({ inhibitors: [inhibitors.botAdminsOnly], group: CommandCategories["Bot Owner"], args: [new Remainder(String)], admin: true, usage: "<members:...guildmember|snowflake>", description: commandDescriptions.dethrone })
  async dethrone(msg: Message, _members: string): PV<void> {
    await msg.delete();
    const members: GuildMember[] = [];
    const logObject: { member: GuildMember, roles: Role[] }[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    for await (const member of members) {
      const roles = member.roles.cache.filter(r => !r.managed && msg.guild.me.roles.highest.position > r.position && r.id !== msg.guild.roles.everyone.id).array();
      if (roles.length === 0) continue;
      await DethronedUser.create({
        id: member.user.id,
        roles: roles.map(r => r.id)
      }).save();
      logObject.push({ member, roles });
      await member.roles.remove(roles, strings.modules.rolemanagement.dethrone.auditLogReason(msg.author));
    }
    await msg.channel.send([strings.modules.rolemanagement.dethrone.success, codeblockMember([], logObject.map(o => o.member))].join("\n"), { split: true });
    const channel = await msg.client.channels.fetch(CHANNELS.ERIS_LOG) as TextChannel;
    await channel.send(strings.modules.rolemanagement.dethrone.log(msg.author, logObject), { allowedMentions: { roles: [], users: [] } });
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: CommandCategories["Bot Owner"], args: [new Remainder(String)], admin: true, usage: "<members:...guildmember|snowflake>", description: commandDescriptions.crown })
  async crown(msg: Message, _members: string): PV<void> {
    await msg.delete();
    const members: GuildMember[] = [];
    const logObject: { member: GuildMember, roles: Role[] }[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    for await (const member of members) {
      const user = await DethronedUser.findOne({ where: { id: member.user.id } });
      if (!user) continue;
      logObject.push({ member, roles: user.roles.map(r => msg.guild.roles.resolve(r)) });
      await member.roles.add(user.roles.map(r => msg.guild.roles.resolve(r)), strings.modules.rolemanagement.crown.auditLogReason(msg.author));
      await user.remove();
    }
    await msg.channel.send([strings.modules.rolemanagement.crown.success, codeblockMember(logObject.map(o => o.member), [])].join("\n"), { split: true });
    const channel = await msg.client.channels.fetch(CHANNELS.ERIS_LOG) as TextChannel;
    await channel.send(strings.modules.rolemanagement.crown.log(msg.author, logObject), { allowedMentions: { roles: [], users: [] } });
  }
}