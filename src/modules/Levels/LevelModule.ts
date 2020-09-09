import { monitor, Module, ErisClient, MAIN_GUILD_ID, levelConstants, strings, roleParser, userParser, inhibitors, command, Optional, Remainder, CommandCategories, commandDescriptions, channelParser, Embed, NEGATIONS, guildMemberParser, ROLES } from "@lib/utils";
import { Message, GuildMember, Role } from "discord.js";
import RedisClient from "@lib/utils/client/RedisClient";
import { UserXP, XPExclusion, LevelRole } from "@lib/utils/database/models";

export default class LevelModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  getRandomXP(): number {
    return Math.floor(Math.random() * 26) + 25;
  }

  @monitor({ event: "message" })
  async onMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.guild.id !== MAIN_GUILD_ID) return;

    // blacklists, woohoo
    const roleExclusions = await XPExclusion.find({ where: { type: "role" } });
    const channelExclusions = await XPExclusion.find({ where: { type: "channel" } });
    if (channelExclusions.find(c => c.id === message.channel.id)) return;
    if (roleExclusions.find(r => message.member.roles.cache.has(r.id))) return;
    if (await RedisClient.get(`player:${message.author.id}:check`)) return;
    let user = await UserXP.findOne({ where: { id: message.author.id } });
    if (!user) user = await UserXP.create({ id: message.author.id }).save();

    user.xp += this.getRandomXP();
    await user.save();

    await this.levelRoleCheck(message, user.xp);

    await RedisClient.set(`player:${message.author.id}:check`, "1", "ex", 60);
  }

  async levelRoleCheck(msg: Message, xp: number): Promise<void> {
    if (msg.member.roles.cache.find(r => r.name === "Muted")) return;
    const userLevel = levelConstants.getLevelFromXP(xp);
    let rolesData = await LevelRole.find();
    rolesData = rolesData.sort((a, b) => a.level - b.level);
    const roleData = rolesData.find(r => r.level === userLevel);
    if (!roleData) {
      const data = rolesData.filter(rr => rr.level < userLevel).reverse()[0];
      if (!data) return;
      const previousRole = rolesData[rolesData.indexOf(data) - 1] || null;
      if (previousRole) msg.member.roles.remove(previousRole.id, strings.modules.levels.auditlog.roleRemove).catch(_ => _);
      msg.member.roles.add(data.id, strings.modules.levels.auditlog.roleAdd);
    } else {
      const previousRole = rolesData[rolesData.indexOf(roleData) - 1] || null;
      if (previousRole) msg.member.roles.remove(previousRole.id, strings.modules.levels.auditlog.roleRemove).catch(_ => _);
      msg.member.roles.add(roleData.id, strings.modules.levels.auditlog.roleAdd);
    }
  }

  @command({ inhibitors: [inhibitors.adminOnly], args: [String, new Remainder(String)], group: CommandCategories["Server Administrator"], staff: true, description: commandDescriptions.xpignore, usage: "<channel|role> <ID/mention>" })
  async xpignore(msg: Message, type: "channel" | "role", id: string): Promise<void | Message> {
    if (msg.channel.type === "dm") return;
    if (type === "role") {
      const role = await roleParser(id, msg);
      if (typeof role === "string") return msg.channel.send(strings.general.error(role));
      if (msg.member.roles.cache.has(role.id)) return msg.channel.send(strings.general.error(strings.modules.exclusions.cantAddRoleToExclusions));
      await XPExclusion.create({
        type: "role",
        id: role.id
      }).save();
      msg.channel.send(strings.general.success(strings.modules.levels.executedExclusions("role")));
    } else if (type === "channel") {
      const channel = await channelParser(id, msg);
      if (typeof channel === "string") return msg.channel.send(strings.general.error(channel));
      await XPExclusion.create({
        type: "channel",
        id: channel.id
      }).save();
      msg.channel.send(strings.general.success(strings.modules.levels.executedExclusions("channel")));
    }
  }

  @command({ inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [new Optional(String), new Optional(String), new Optional(new Remainder(String))], staff: true, description: commandDescriptions.exclusions, usage: "[remove] [channel|role] [ID/mention]" })
  async xpexclusions(msg: Message, what?: "remove", type?: "role" | "channel", id?: string): Promise<Message> {
    if (!what) {
      const roleExclusions = await XPExclusion.find({ where: { type: "role" } });
      const channelExclusions = await XPExclusion.find({ where: { type: "channel" } });
      const embed = new Embed()
        .addField(strings.modules.levels.exclusionEmbedName("Channel"), channelExclusions.map(u => strings.modules.levels.exclusionMapping(u)).join("\n") || strings.modules.levels.noChannelsExcluded)
        .addField(strings.modules.levels.exclusionEmbedName("Role"), roleExclusions.map(r => strings.modules.levels.exclusionMapping(r)).join("\n") || strings.modules.levels.noRolesExcluded);
      return msg.channel.send(embed);
    }
    if (!["remove"].includes(what)) return msg.channel.send(strings.general.error(strings.general.commandSyntax("e!xpexclusions [remove] [channel|role] [ID/mention]")));

    if (what === "remove") {
      if (!type || !["channel", "role"].includes(type) || !id) return msg.channel.send(strings.general.error(strings.general.commandSyntax("e!xpexclusions [remove] [channel|role] [ID/mention]")));
      if (type === "role") {
        const exclusion = await XPExclusion.findOne({ where: { id: id, type: "role" } });
        if (!exclusion) return msg.channel.send(strings.general.error(strings.modules.levels.roleNotExcluded));
        exclusion.remove();
        msg.channel.send(strings.general.success(strings.modules.levels.updatedExclusionsForRole));
      } else if (type === "channel") {
        const exclusion = await XPExclusion.findOne({ where: { id: id, type: "channel" } });
        if (!exclusion) return msg.channel.send(strings.general.error(strings.modules.levels.channelNotExcluded));
        exclusion.remove();
        msg.channel.send(strings.general.success(strings.modules.levels.updatedExclusionsForChannel));
      }
    }
  }

  @command({ inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [String, new Optional(new Remainder(String))], staff: true, description: commandDescriptions.resetxp, usage: "<user|role|server> [users:...user]" })
  async resetxp(msg: Message, type: "role" | "user" | "server", _members: string): Promise<void|Message> {
    if (type === "server") {
      await msg.channel.send(strings.modules.levels.resetxp.serverReset);
      let members = 0;
      const message = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 60000 });
      if (message.first() && message.first().content.toLowerCase() === "yes") {
        for await (const member of msg.guild.members.cache.array()) {
          const xpData = await UserXP.findOne({ where: { id: member.id } });
          if (!xpData) continue;
          xpData.xp = 0;
          await xpData.save();
          members++;
        }
        msg.channel.send(strings.general.success(strings.modules.levels.resetxp.resetxpsuccessfull("user", members)));
      } else return msg.channel.send(strings.modules.levels.resetxp.cancelled);
    } else if (type === "user") {
      const members: GuildMember[] = [];
      for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
      if (members.includes(msg.member)) members.splice(members.indexOf(msg.member), 1);
      for await (const member of members) {
        const xpData = await UserXP.findOne({ where: { id: member.id } });
        if (!xpData) continue;
        xpData.xp = 0;
        await xpData.save();
      }
      msg.channel.send(strings.general.success(strings.modules.levels.resetxp.resetxpsuccessfull("user", members.length)));
    } else if (type === "role") {
      const roles: Role[] = [];
      for await (const _member of _members.split(" ")) roles.push(await roleParser(_member, msg) as Role);
      let members: GuildMember[] = [];
      roles.forEach(r => members.push(...r.members.array()));
      members = members.filter((v,i) => members.indexOf(v) === i);
      for await (const member of members) {
        const xpData = await UserXP.findOne({ where: { id: member.id } });
        if (!xpData) continue;
        xpData.xp = 0;
        await xpData.save();
      }
      msg.channel.send(strings.general.success(strings.modules.levels.resetxp.resetxpsuccessfull("role", roles.length, members.length)));
    } else return msg.channel.send(strings.general.error(strings.general.commandSyntax("e!resetxp <user|role|server> [users:...user]")));
  }

  @command({ inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [Number, new Optional(new Remainder(String))], staff: true, description: commandDescriptions.addxp, usage: "<amount:number> [users:...user]" })
  async addxp(msg: Message, amount: number, _members: string): Promise<void|Message> {
    if (!msg.member.roles.cache.has(ROLES.LEAD_ADMINISTRATORS)) return;
    const members: GuildMember[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    for await (const member of members) {
      let xpData = await UserXP.findOne({ where: { id: member.id } });
      if (!xpData) xpData = await UserXP.create({ id: member.id }).save();
      xpData.xp += amount;
      await xpData.save();
    }
    msg.channel.send(strings.modules.levels.xpAdded(amount, members.length));
  }


  @command({ inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [Number, new Optional(new Remainder(String))], staff: true, description: commandDescriptions.addxp, usage: "<amount:number> [users:...user]" })
  async takexp(msg: Message, amount: number, _members: string): Promise<void|Message> {
    if (!msg.member.roles.cache.has(ROLES.LEAD_ADMINISTRATORS)) return;
    const members: GuildMember[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    for await (const member of members) {
      let xpData = await UserXP.findOne({ where: { id: member.id } });
      if (!xpData) xpData = await UserXP.create({ id: member.id }).save();
      xpData.xp -= amount;
      if (xpData.xp < 0) xpData.xp = 0;
      await xpData.save();
    }
    msg.channel.send(strings.modules.levels.xpAdded(amount, members.length));
  }
}