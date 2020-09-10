import { monitor, Module, ErisClient, MAIN_GUILD_ID, levelConstants, strings, roleParser, inhibitors, command, Optional, Remainder, CommandCategories, commandDescriptions, channelParser, Embed, NEGATIONS, guildMemberParser, ROLES, escapeRegex } from "@lib/utils";
import { Message, GuildMember, Role, User } from "discord.js";
import RedisClient from "@lib/utils/client/RedisClient";
import { UserXP, XPExclusion, LevelRole, XPMultiplier } from "@lib/utils/database/models";
import Duration from "@lib/utils/arguments/Duration";

export default class LevelModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  @monitor({ event: "guildMemberUpdate" })
  async onGuildMemberRoleAdd(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (newMember.guild.id !== MAIN_GUILD_ID) return;
    const xpData = await UserXP.findOne({ where: { id: newMember.id } });
    if (!xpData) return;
    const userLevel = levelConstants.getLevelFromXP(xpData.xp);
    let rolesData = await LevelRole.find();
    rolesData = rolesData.sort((a, b) => a.level - b.level);
    const roleData = rolesData.find(r => r.level === userLevel);
    if (!roleData) {
      const data = rolesData.filter(rr => rr.level < userLevel).reverse()[0];
      if (!data) return;
      if (oldMember.roles.cache.has(data.id) && !newMember.roles.cache.has(data.id)) {
        const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
        const firstEntry = auditLogs.entries.first();
        if (!(firstEntry.changes[0].key === "$remove" && ["242730576195354624", this.client.user.id].includes(firstEntry.executor.id)))
          newMember.roles.add(data.id, strings.modules.levels.auditLogRoleRemove);
      }
    } else {
      if (oldMember.roles.cache.has(roleData.id) && !newMember.roles.cache.has(roleData.id)) {
        const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
        const firstEntry = auditLogs.entries.first();
        if (!(firstEntry.changes[0].key === "$remove" && ["242730576195354624", this.client.user.id].includes(firstEntry.executor.id)))
          newMember.roles.add(roleData.id, strings.modules.levels.auditLogRoleRemove);
      }
    }
  }

  @monitor({ event: "guildMemberUpdate" })
  async onGuildMemberRoleAdd2(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (newMember.guild.id !== MAIN_GUILD_ID) return;
    const levelData = await LevelRole.find();
    const roles = levelData.map(r => r.id);
    for (const role of roles) {
      if (!oldMember.roles.cache.has(role) && newMember.roles.cache.has(role)) {
        if (newMember.roles.cache.has(ROLES.HYACINTH)) newMember.roles.remove(ROLES.HYACINTH);
      }
    }
  }

  getRandomXP(): number {
    return Math.floor(Math.random() * 26) + 25;
  }

  @monitor({ event: "message" })
  async onMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.guild.id !== MAIN_GUILD_ID) return;

    let user = await UserXP.findOne({ where: { id: message.author.id } });
    if (!user) user = await UserXP.create({ id: message.author.id }).save();

    const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${escapeRegex(process.env.PREFIX)})\\s*`);
    if (prefixRegex.test(message.content)) return;

    // blacklists, woohoo
    const roleExclusions = await XPExclusion.find({ where: { type: "role" } });
    const channelExclusions = await XPExclusion.find({ where: { type: "channel" } });
    if (channelExclusions.find(c => c.id === message.channel.id)) return;
    if (roleExclusions.find(r => message.member.roles.cache.has(r.id))) return;
    if (await RedisClient.get(`player:${message.author.id}:check`)) return;

    const randomXP = this.getRandomXP();

    const userMultipliers = await XPMultiplier.find({ where: { type: "user", userID: message.author.id } });
    const serverMultipliers = await XPMultiplier.find({ where: { type: "server" } });

    for await (const multiplier of [...userMultipliers, ...serverMultipliers]) {
      if (multiplier.endDate) {
        if (multiplier.endDate.getTime() <= new Date().getTime()) {
          await multiplier.remove();
          continue;
        }
      }
      user.xp += (multiplier.multiplier * randomXP);
    }

    user.xp += randomXP;
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

  @command({ inhibitors: [inhibitors.adminOnly], args: [String, new Remainder(String)], group: CommandCategories["Server Administrator"], aliases: ["xpi"], staff: true, description: commandDescriptions.xpignore, usage: "<channel|role> <ID/mention>" })
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

  @command({ inhibitors: [inhibitors.adminOnly], args: [new Optional(String), new Optional(String), new Optional(new Remainder(String))], group: CommandCategories["Server Administrator"], aliases: ["xpe"], staff: true, description: commandDescriptions.exclusions, usage: "[remove] [channel|role] [ID/mention]" })
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
  async resetxp(msg: Message, type: "role" | "user" | "server", _members: string): Promise<void | Message> {
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
      members = members.filter((v, i) => members.indexOf(v) === i);
      for await (const member of members) {
        const xpData = await UserXP.findOne({ where: { id: member.id } });
        if (!xpData) continue;
        xpData.xp = 0;
        await xpData.save();
      }
      msg.channel.send(strings.general.success(strings.modules.levels.resetxp.resetxpsuccessfull("role", roles.length, members.length)));
    } else return msg.channel.send(strings.general.error(strings.general.commandSyntax("e!resetxp <user|role|server> [users:...user]")));
  }

  @command({ inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [Number, new Optional(new Remainder(String))], aliases: ["ae"], staff: true, description: commandDescriptions.addexperience, usage: "<amount:number> [users:...user]" })
  async addexperience(msg: Message, amount: number, _members: string): Promise<void | Message> {
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

  @command({ inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [Number, new Optional(new Remainder(String))], aliases: ["de"], staff: true, description: commandDescriptions.deductexperience, usage: "<amount:number> [users:...user]" })
  async deductexperience(msg: Message, amount: number, _members: string): Promise<void | Message> {
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

  @command({ inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [GuildMember, Number], staff: true, description: commandDescriptions.setlevel, usage: "<user:user> <level:number>" })
  async setlevel(msg: Message, member: GuildMember, level: number): Promise<void | Message> {
    if (!msg.member.roles.cache.has(ROLES.LEAD_ADMINISTRATORS)) return;

    let xpData = await UserXP.findOne({ where: { id: member.id } });
    if (!xpData) xpData = await UserXP.create({ id: member.id }).save();
    xpData.xp = levelConstants.getLevelXP(level);
    await xpData.save();

    msg.channel.send(strings.modules.levels.levelSet(member.user, level));
  }

  @command({ inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands], args: [new Optional(GuildMember)], description: commandDescriptions.rank, usage: "[user:user]" })
  async rank(msg: Message, member?: GuildMember): Promise<void | Message> {
    if (!member) member = msg.member;
    const data = await userInfo(member.user);
    const embed = new Embed()
      .setTitle("Experience & Level Progression")
      .setAuthor(member.user.tag, member.user.avatarURL({ dynamic: true, format: "png" }))
      .addField("Rank", `${data.rank}/${data.total_users}`, true)
      .addField("Level", data.lvl, true)
      .addField("Experience", `${data.remaining_xp}/${data.level_xp} XP`, true)
      .addField("Total Experience", `${data.total_xp} XP`, true);
    msg.channel.send(embed);
  }

  @command({ inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [String, String, Number, new Optional(Duration)], staff: true, aliases: ["am"], description: commandDescriptions.activatemultiplier, usage: "<user|server> <userid:string> <multiplier> [duration]" })
  async activatemultiplier(msg: Message, type: "user" | "server", userID: string, multiplier: number, duration?: Duration): Promise<void | Message> {
    if (!["server", "user"].includes(type)) return msg.channel.send(strings.general.error(strings.general.commandSyntax("e!activatemultiplier <user|server> <userid:string> <multiplier> [duration]")));
    await XPMultiplier.create({
      type: type,
      userID: type === "user" ? userID : null,
      multiplier: multiplier,
      endDate: duration ? new Date(Math.round(Date.now()) + duration.duration) :  null
    }).save();
    msg.channel.send(strings.general.success(strings.modules.levels.multiplierCreated(type)));
  }

  @command({ inhibitors: [inhibitors.adminOnly], args: [String, new Optional(String), new Optional(String)], group: CommandCategories["Server Administrator"], staff: true, description: commandDescriptions.multiplier, usage: "<exhaust|list> [user|server] [user]" })
  async multiplier(msg: Message, what?: "exhaust" | "list", type?: "user" | "server", id?: string): Promise<Message> {
    if (!["exhaust", "list"].includes(what)) return msg.channel.send(strings.general.error(strings.general.commandSyntax("e!multiplier <exhaust|list> [user|server] [user]")));

    if (what === "exhaust") {
      if (!type || !["user", "server"].includes(type)) return msg.channel.send(strings.general.error(strings.general.commandSyntax("e!multiplier <exhaust|list> [user|server] [user]")));
      if (type === "user") {
        if (!id) return msg.channel.send(strings.general.error(strings.modules.levels.missingUserId));
        const multiplier = await XPMultiplier.findOne({ where: { userID: id, type: "user" } });
        if (!multiplier) return msg.channel.send(strings.general.error(strings.modules.levels.noMultiplierFound));
        multiplier.remove();
        msg.channel.send(strings.general.success(strings.modules.levels.removedMultiplier));
      } else if (type === "server") {
        const multipliers = await XPMultiplier.find({ where: { type: "server" } });
        await multipliers.map(m => m.remove());
        msg.channel.send(strings.general.success(strings.modules.levels.removedMultiplier));
      }
    } else if (what === "list") {
      const serverMultipliers = await XPMultiplier.find({ where: { type: "server" } });
      const userMultipliers = await XPMultiplier.find({ where: { type: "user" } });
      const embed = new Embed()
        .addField(strings.modules.levels.multiplierEmbedName("Server"), serverMultipliers.map(s => strings.modules.levels.multiplierMapping(s)).join("\n▬▬▬\n") || strings.modules.levels.noMultipliers)
        .addField(strings.modules.levels.multiplierEmbedName("User"), userMultipliers.map(u => strings.modules.levels.multiplierMapping(u)).join("\n▬▬▬\n") || strings.modules.levels.noMultipliers);
      return msg.channel.send(embed);
    }
  }
}

const userInfo = async (user: User) => {
  const xpData = await UserXP.findOne({ where: { id: user.id } });
  let allData = await UserXP.find();
  allData = allData.sort((a, b) => b.xp - a.xp);
  const user_total_xp = xpData.xp;
  const user_lvl = levelConstants.getLevelFromXP(user_total_xp);
  let x = 0;

  for (let i = 0; i < user_lvl; i++) {
    x += levelConstants.getLevelXP(i);
  }
  const remaining_xp = user_total_xp - x;

  const level_xp = levelConstants.getLevelXP(user_lvl);

  return {
    total_xp: user_total_xp,
    lvl: user_lvl,
    remaining_xp: remaining_xp,
    level_xp: level_xp,
    rank: allData.findIndex(a => a.id === user.id) + 1,
    total_users: allData.length
  };
};